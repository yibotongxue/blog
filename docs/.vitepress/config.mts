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

    sidebar: {
      '/blog/': [
        {
          text: 'Blog',
          link: '/blog/',
          items: [
            { text: "自动下载", link: '/blog/auto-download' },
            { text: "通过 Docker 安装 MindSpore", link: '/blog/docker-mindspore' },
            { text: "搭建服务器环境", link: '/blog/server-setup' },
            { text: "搭建私有镜像仓库", link: '/blog/docker-registry' },
            { text: "常用脚本", link: '/blog/script' },
          ]
        },
        {
          text: '现代 C++',
          link: '/blog/modern-cpp/',
          items: [
            { text: "iota", link: '/blog/modern-cpp/iota' },
            { text: "C++ 中的输出：从 printf 到 std::print", link: '/blog/modern-cpp/print' },
          ]
        }
      ],
      '/backend/': [
        {
          text: '数据结构',
          link: '/backend/datastructure/',
          items: [
            { text: '外排序', link: '/backend/datastructure/external-sort' },
          ]
        },
        {
          text: '数据库',
          link: '/backend/database/',
          items: [
            { text: 'MySQL 基础', link: '/backend/database/mysql-base' },
            { text: 'MySQL 检索', link: '/backend/database/mysql-search' },
            { text: 'MySQL 过滤', link: '/backend/database/mysql-filter' },
            { text: 'MySQL 数据处理', link: '/backend/database/mysql-dataprocess' },
            { text: 'MySQL 子查询和联结', link: '/backend/database/mysql-subquery-and-join' },
          ]
        },
        {
          text: 'Java程序设计',
          link: '/backend/Java/',
          items: [
            { text: 'Java 简介', link: '/backend/Java/intro' },
            { text: 'Java 基础', link: '/backend/Java/basic' },
            { text: '深入理解 Java', link: '/backend/Java/deep_understanding' },
            { text: '异常处理与常用工具类', link: '/backend/Java/exception_and_utils_class' },
          ]
        },
        {
          text: '算法设计与分析',
          link: '/backend/algorithm/',
          items: [
            { text: '动态规划', link: '/backend/algorithm/dp' },
            { text: '线性规划', link: '/backend/algorithm/linear_programming' },
            {
              text: '网络流算法',
              link: '/backend/algorithm/network_flow',
              items: [
                { text: '最大流问题', link: '/backend/algorithm/network_flow/max_flow' },
                { text: '最小费用流', link: '/backend/algorithm/network_flow/min_cost' },
              ]
            }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yibotongxue/blog' }
    ]
  },

  // enable math equation in markdown.
  markdown: {
    math: true
  }
})
