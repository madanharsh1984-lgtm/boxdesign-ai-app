import React, { useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { colours } from '@/theme/colours';

interface ThreeJsViewerProps {
  dimensions: { length: number; width: number; height: number };
  textureUri?: string;
}

const ThreeJsViewer: React.FC<ThreeJsViewerProps> = ({ dimensions, textureUri }) => {
  const webViewRef = useRef<WebView>(null);

  // Simple HTML with Three.js to render a box
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
        <style>
          body { margin: 0; overflow: hidden; background-color: #0D2240; }
          canvas { width: 100%; height: 100%; }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      </head>
      <body>
        <script>
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          document.body.appendChild(renderer.domElement);

          // Geometry based on dimensions
          const geometry = new THREE.BoxGeometry(${dimensions.length / 10}, ${dimensions.height / 10}, ${dimensions.width / 10});
          
          let material;
          if ('${textureUri}') {
            const loader = new THREE.TextureLoader();
            const texture = loader.load('${textureUri}');
            material = new THREE.MeshStandardMaterial({ map: texture });
          } else {
            material = new THREE.MeshStandardMaterial({ color: 0xE67E22, roughness: 0.7, metalness: 0.2 });
          }
          
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(5, 5, 5);
          scene.add(directionalLight);

          camera.position.z = 15;

          function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
          }
          animate();

          window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colours.accent} />
          </View>
        )}
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colours.bgDark,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.bgDark,
  },
});

export default ThreeJsViewer;
