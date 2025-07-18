// src/features/organisations/lib/moduleMap.ts

import dynamic from 'next/dynamic';

const moduleMap: Record<string, React.ComponentType<any>> = {
  HRMS: dynamic(() => import('@/features/organisations/modules/hrms-module'), { ssr: false }),
  QMS: dynamic(() => import('@/features/organisations/modules/QMS'), { ssr: false }),
  HSEMS: dynamic(() => import('@/features/organisations/modules/HSEMS'), { ssr: false }),
};

export const loadModule = (moduleName: string) => {
  return moduleMap[moduleName];
};

// Define a type for your module entry points.
// 'Component' is the primary React component for the module's main page.
// 'defaultPath' is the route within your dashboard for this module.
// 'icon' can be used for UI display.
// type ModuleEntry = {
//   Component: ComponentType<any>;
//   defaultPath: string;
//   icon: string; // Or a React component if you want more complex icons
//   // Add other module-specific metadata if needed, e.g., specific permissions required
// };

// // Use a Record to map module names (from your DB 'name' field) to their dynamic imports.
// // The structure `async () => ({ Component: dynamic(...) })` allows for loading
// // other module-specific data alongside the component if needed.
// const moduleMap: Record<string, () => Promise<ModuleEntry>> = {
//   HRMS: async () => ({
//     Component: dynamic(() => import('@/features/organisations/modules/HRMS'), {
//       loading: () => <ModuleLoader />, 
//       ssr: false, // Ensure this component is only rendered on the client after initial page load
//     }),
//     defaultPath: '/dashboard/hrms',
//     icon: '👥', // Example icon
//   }),
//   HSEMS: async () => ({
//     Component: dynamic(() => import('./hsems/HSEMSDashboard'), {
//       loading: () => <ModuleLoader />,
//       ssr: false,
//     }),
//     defaultPath: '/dashboard/hsems',
//     icon: '👷', // Example icon
//   }),
//   QMS: async () => ({
//     Component: dynamic(() => import('./qms/QMSDashboard'), {
//       loading: () => <ModuleLoader />,
//       ssr: false,
//     }),
//     defaultPath: '/dashboard/qms',
//     icon: '📝', // Example icon
//   }),
//   // Add more modules here as you develop them
// };

// // A simple loading component for dynamic imports
// const ModuleLoader = () => (
//   <div className="flex items-center justify-center h-64">
//     <p className="text-lg text-gray-500">Loading module...</p>
//   </div>
// );

// export default moduleMap;