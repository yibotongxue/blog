import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  title: "My Awesome Project",
  description: "A VitePress Site",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Blog',
        items: [
          
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yibotongxue/blog' }
    ]
  }
})
