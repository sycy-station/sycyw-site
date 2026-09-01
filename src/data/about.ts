export const ABOUT = {
  hero: {
    heroTitle: '用创意和科技连接二次元与现实',
    heroDescription:
      '森韵次元坞从一个人的开发项目起步，如今是一支由二次元爱好者与技术成员组成的团队。我们做服务器托管、社区平台和内容工具，把喜欢的东西做成能长期跑下去的产品。',
    heroImage:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20editorial%20photograph%2C%20quiet%20workspace%20with%20a%20single%20monitor%20displaying%20abstract%20line%20art%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20high%20detail%2C%20architectural%20calm&image_size=landscape_16_9',
    heroImageAlt: '安静的工作台，显示器上是抽象线条图形',
  },

  story: {
    sectionTitle: '我们的故事',
    storyImage:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20hands%20sketching%20interface%20wireframes%20on%20grid%20paper%20beside%20a%20keyboard%2C%20overhead%20view%2C%20soft%20diffused%20light%2C%20fine%20grain%2C%20black%20and%20white%2C%20documentary%20style&image_size=landscape_4_3',
    storyImageAlt: '在方格纸上手绘界面草图的俯拍画面',
    storyParagraphs: [
      '起点很小。最早只是想给自己和朋友解决一个具体问题：找一个稳定、价格合理、不需要反复折腾的服务器环境。于是有了第一个托管项目，用户就是身边这几个人。',
      '转折发生在需求开始超出个人能力的时候。使用的人多了，问题不再只是技术问题，还包括服务响应、稳定性承诺和长期维护。我们开始正式组建团队，把零散的项目整理成可以对外交付的产品线。',
      '现在我们同时推进托管支持、社区平台和开发项目三条线。规模不大，但每一个还在运行的项目都有人负责，这是我们目前最看重的事。',
    ],
  },

  values: [
    {
      icon: '01',
      title: '创新无界',
      description:
        '不预设边界。二次元文化和工程技术之间没有必然的分界线，好想法可以来自任何一侧，我们只关心它能不能做出来。',
      order: 1,
    },
    {
      icon: '02',
      title: '用户至上',
      description:
        '用户提出的问题优先于我们自己的规划。功能可以慢一点，但已经上线的东西必须可靠，出问题要有人接。',
      order: 2,
    },
    {
      icon: '03',
      title: '热爱与激情',
      description:
        '团队成员本身就是这个文化的参与者。做自己会用、会推荐给朋友的产品，这一点比任何激励机制都更有效。',
      order: 3,
    },
  ],

  mission: {
    title: '我们的使命',
    description:
      '让喜欢二次元文化的人有更好的技术工具和更稳定的平台，也让技术本身成为表达热爱的一种方式。我们不做只能演示的项目，只做能持续运行、有人使用的产品。',
    statement: '把热爱做成能长期运转的东西',
  },

  timeline: [
    {
      year: '2018',
      title: '最初的尝试',
      description:
        '以个人项目形式起步，围绕服务器环境和社区工具做早期探索，用户主要是同好圈内的朋友。',
      status: 'completed' as const,
      order: 1,
    },
    {
      year: '2022',
      title: '托管服务成型',
      description:
        '托管支持业务正式对外提供，开始承担稳定性和服务响应的长期承诺，项目从个人尝试转为需要维护的服务。',
      status: 'completed' as const,
      order: 2,
    },
    {
      year: '2024',
      title: '团队组建',
      description:
        '组建正式团队，明确开发、运维和内容方向的分工，把零散项目整理为托管支持、开发项目、社区合作三条线。',
      status: 'completed' as const,
      order: 3,
    },
    {
      year: '2025',
      title: '产品线扩展',
      description:
        '推进社区平台与开发项目建设，同时与站外社区建立合作关系，产品结构基本稳定。',
      status: 'completed' as const,
      order: 4,
    },
    {
      year: '2026',
      title: '品牌与站点重建',
      description:
        '统一对外品牌信息，重建官方站点的信息架构与内容体系，让每一条对外信息都可核实。',
      status: 'current' as const,
      order: 5,
    },
  ],
};
