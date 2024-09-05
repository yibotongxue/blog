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
      { text: 'Another', link: 'https://baidu.com' }
    ],

    sidebar: [
      {
        text: 'Folder',
        items: [
          { text: 'file', link: '/folder/file' },
          { text: 'file1', link: '/folder/file1' },
          { text: 'file2', link: '/folder/file2' }
        ]
      },
      {
        text: 'Folder1',
        items: [
          { text: 'file3', link: '/folder1/file3' },
          { text: 'file4', link: '/folder1/file4' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yibotongxue/blog' }
    ]
  }
})
