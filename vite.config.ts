import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa' 
export default defineConfig({
    base: '/CMPM-121-Final/',
    plugins: [
        vue(), 
        VitePWA({
            manifest: {
                name: "Fish Farm",
                short_name: "FishFarm",
                description: "A fun fish farming game!",
                icons: [
                    {
                        src: "/CMPM-121-Final//icons/fish.png",
                        sizes: "512x512",
                        type: "image/png",
                       
                    },
                ],
                display: "standalone",
                start_url: "/CMPM-121-Final/",
                scope: "/CMPM-121-Final/",
                background_color: "#ffffff",
                theme_color: "#4CAF50",
            },
        }),
    ],
    build: {
        outDir: './wwwroot',
        emptyOutDir: true,
    },
    resolve: {
        alias : {   
            '@': fileURLToPath(new URL('src', import.meta.url)),
        },
    },
})
