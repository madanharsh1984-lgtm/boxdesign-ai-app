import { Redirect } from 'expo-router';

// Entry point redirects to Splash screen
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}