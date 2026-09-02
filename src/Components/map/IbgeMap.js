import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/** GeoServer WMS do IBGE (BC250 2025) — gratuito, sem chave Google. */
export const IBGE_WMS_URL = 'https://geoservicos.ibge.gov.br/geoserver/CCAR/wms';
export const IBGE_WMS_LAYER = 'CCAR:bc250_2025';

function buildHtml({ latitude, longitude, latitudeDelta }) {
  const zoom = Math.max(3, Math.min(16, Math.round(Math.log2(360 / (latitudeDelta || 0.09)))));
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #E8D5D0; }
    .leaflet-control-attribution {
      background: rgba(11,13,15,0.75) !important;
      color: rgba(255,255,255,0.65) !important;
      font-size: 9px !important;
    }
    .leaflet-control-attribution a { color: #FC2B5E !important; }
    /* NÃO usar filter CSS no tile-pane: no Android WebView os tiles ficam pretos/invisíveis. */
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      // Evita “mundo cinza” enquanto os tiles IBGE chegam
      preferCanvas: false,
    }).setView([${latitude}, ${longitude}], ${zoom});

    // Base de ruas gratuita (não-Google) — BC250 sozinha é esparsa no zoom de bairro.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '© OpenStreetMap · © CARTO',
    }).addTo(map);

    // Camada oficial IBGE por cima (WMS gratuito).
    L.tileLayer.wms(${JSON.stringify(IBGE_WMS_URL)}, {
      layers: ${JSON.stringify(IBGE_WMS_LAYER)},
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      uppercase: true,
      opacity: 0.72,
      attribution: '© IBGE · BC250 2025',
      maxZoom: 16,
      tileSize: 256,
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);

    function colorFor(isTest) {
      return isTest ? '#F5B841' : '#FC2B5E';
    }

    function setMarkers(list) {
      markerLayer.clearLayers();
      (list || []).forEach((v) => {
        if (v.latitude == null || v.longitude == null) return;
        const m = L.circleMarker([v.latitude, v.longitude], {
          radius: v.isTest ? 9 : 7,
          color: '#FFF8F9',
          weight: 2,
          fillColor: colorFor(!!v.isTest),
          fillOpacity: 0.95,
        });
        if (v.name) m.bindPopup(String(v.name));
        m.addTo(markerLayer);
      });
    }

    function animateToRegion(region) {
      if (!region || region.latitude == null || region.longitude == null) return;
      const z = Math.max(3, Math.min(17, Math.round(Math.log2(360 / (region.latitudeDelta || 0.01)))));
      map.flyTo([region.latitude, region.longitude], z, { duration: 0.55 });
    }

    document.addEventListener('message', handleNative);
    window.addEventListener('message', handleNative);

    function handleNative(event) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data || !data.type) return;
        if (data.type === 'setMarkers') setMarkers(data.markers);
        if (data.type === 'animateToRegion') animateToRegion(data.region);
      } catch (e) {}
    }

    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  </script>
</body>
</html>`;
}

/**
 * Mapa Check-in sem Google Maps: Leaflet + WMS IBGE (BC250) sobre base Carto.
 * Expõe `animateToRegion` via ref.
 */
const IbgeMap = forwardRef(function IbgeMap(
  { style, initialRegion, markers = [], onMapReady },
  ref,
) {
  const webRef = useRef(null);
  const readyRef = useRef(false);
  const pendingRef = useRef([]);

  const html = useMemo(
    () =>
      buildHtml({
        latitude: initialRegion?.latitude ?? -15.7942,
        longitude: initialRegion?.longitude ?? -47.8822,
        latitudeDelta: initialRegion?.latitudeDelta ?? 0.09,
      }),
    // HTML só na montagem — pan/zoom depois via injectJavaScript
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const post = useCallback((payload) => {
    const msg = JSON.stringify(payload);
    const js = `(function(){try{window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(
      msg,
    )}}));}catch(e){}})(); true;`;
    if (!readyRef.current || !webRef.current) {
      pendingRef.current.push(js);
      return;
    }
    webRef.current.injectJavaScript(js);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      animateToRegion(region) {
        post({ type: 'animateToRegion', region });
      },
    }),
    [post],
  );

  useEffect(() => {
    post({
      type: 'setMarkers',
      markers: (markers || []).map((m) => ({
        id: m.id,
        name: m.name,
        latitude: m.latitude,
        longitude: m.longitude,
        isTest: !!m.isTest,
      })),
    });
  }, [markers, post]);

  const onMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === 'ready') {
          readyRef.current = true;
          pendingRef.current.forEach((js) => webRef.current?.injectJavaScript(js));
          pendingRef.current = [];
          onMapReady?.();
        }
      } catch {
        // ignore
      }
    },
    [onMapReady],
  );

  return (
    <WebView
      ref={webRef}
      style={[styles.map, style]}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      mixedContentMode="always"
      setSupportMultipleWindows={false}
      androidLayerType="hardware"
      cacheEnabled
    />
  );
});

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8D5D0',
  },
});

export default IbgeMap;
