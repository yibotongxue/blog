import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  title: "个人博客",
  description: "Bob 的个人博客",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Blog',
        link: '/blog/',
        items: [
          { text: "自动下载", link: '/blog/auto-download'},
          { text: "通过 Docker 安装 MindSpore", link: '/blog/docker-mindspore'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yibotongxue/blog' }
    ]
  },

  // enable math equation in markdown.
  markdown: {
    math: true
  }
})
