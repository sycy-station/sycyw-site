export const ABOUT = {
  hero: {
    heroTitle: '用创意和科技连接二次元与现实',
    // 文案来源：旧站 about.html Hero 副文案
    heroDescription:
      '森韵次元成立于2024年，是一家专注于二次元文化与前沿话题融合的创新企业。我们致力于打造独特的产品体验，让科技更有温度，让生活更加精彩。',
    heroImage:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20editorial%20photograph%2C%20quiet%20workspace%20with%20a%20single%20monitor%20displaying%20abstract%20line%20art%2C%20soft%20window%20light%2C%20fine%20film%20grain%2C%20black%20and%20white%2C%20high%20detail%2C%20architectural%20calm&image_size=landscape_16_9',
    heroImageAlt: '安静的工作台，显示器上是抽象线条图形',
  },

  story: {
    sectionTitle: '我们的故事',
    storyImage:
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20monochrome%20photograph%2C%20hands%20sketching%20interface%20wireframes%20on%20grid%20paper%20beside%20a%20keyboard%2C%20overhead%20view%2C%20soft%20diffused%20light%2C%20fine%20grain%2C%20black%20and%20white%2C%20documentary%20style&image_size=landscape_4_3',
    storyImageAlt: '在方格纸上手绘界面草图的俯拍画面',
    // 文案来源：旧站 about.html「我们的故事」三段
    // 口径修正：「七年来」改为不含具体年限的表述（成立口径统一为 2024 年）；
    // 「超过13＋开发团队」按 PRD §11-16 统一为「超过 13 人」
    storyParagraphs: [
      '森韵次元的创始团队由一群热爱二次元文化和科技创新的年轻人组成。我们注意到，二次元文化在年轻人中越来越受欢迎，但真正属于二次元的净土和平台却近乎于无。',
      '2024年，我们怀揣着将二次元文化与平台完美结合的梦想，创立了森韵次元。从最初的 Minecraft 服务器起步，到如今拥有超过 13 人的开发团队，我们始终坚持初心，致力于打造独特的二次元平台。',
      '多年来，我们参与了各个领域的圈子，包括 Vup、术圈、AI 音乐、UI 设计、MC 等，这些经验与调研为我们带来了全新的体验和乐趣。未来，我们将继续探索更多可能性，创造更多令人惊喜的产品。',
    ],
  },

  // 文案来源：旧站 about.html「我们的价值观」
  values: [
    {
      icon: '01',
      title: '创新无界',
      description:
        '我们鼓励突破常规思维，勇于尝试新的技术和创意，不断探索二次元文化与科技融合的可能性。',
      order: 1,
    },
    {
      icon: '02',
      title: '用户至上',
      description:
        '我们始终将用户需求放在首位，倾听用户声音，不断优化产品体验，为用户创造真正的价值。',
      order: 2,
    },
    {
      icon: '03',
      title: '热爱与激情',
      description: '我们热爱二次元文化和科技创新，这份热爱和激情驱动我们不断前行，创造更多精彩。',
      order: 3,
    },
  ],

  mission: {
    title: '我们的使命',
    // 文案来源：旧站 about.html「我们的使命」
    description:
      '森韵次元致力于通过创新科技连接二次元与现实世界，为用户创造更加丰富、有趣、便捷的数字生活体验。我们希望让科技产品更有温度，让二次元文化更加普及，让每一位用户都能在我们的产品中找到惊喜与快乐。',
    statement: '让科技更有温度，让二次元文化更加普及',
  },

  timeline: [
    {
      year: '2018',
      title: '前身项目起步',
      description:
        '森韵次元的前身「OurSky」由创始人冬月一人创立，主营 Minecraft 服务器，积累了最早的一批同好用户。',
      status: 'completed' as const,
      order: 1,
    },
    {
      year: '2022',
      title: '结识伙伴',
      description:
        '结识了后来的核心运维伙伴，并开始为项目积累资金与硬件资源，为后续的产品化做准备。',
      status: 'completed' as const,
      order: 2,
    },
    {
      year: '2024',
      title: '想法初现',
      description:
        '年初有了制作一个二次元平台的想法，并购入了项目所需的物理服务器，项目从设想走向落地。',
      status: 'completed' as const,
      order: 3,
    },
    {
      year: '2024 年末',
      title: '正式启动',
      description:
        '年末结识合伙人，一拍即合，正式创立森韵次元并完成公司注册，「唐山森韵次元科技有限公司」成立。',
      status: 'completed' as const,
      order: 4,
    },
    {
      year: '2025',
      title: '全面发展',
      description:
        '核心团队扩展至 4 人，开发团队扩展至 13 人，各条产品线同步推进，团队欣欣向荣。',
      status: 'completed' as const,
      order: 5,
    },
    {
      year: '2025 年末',
      title: '正式上线筹备',
      description:
        '核心产品进入密集开发与调试阶段，团队围绕正式上线目标持续迭代；最新进展以官方公告为准。',
      status: 'current' as const,
      order: 6,
    },
  ],

  // 侧栏公司概况（VITALS）：据点/形态来源为旧站文案与工商注册地址，替代早期虚构内容
  vitals: {
    cells: [
      { label: '成立', value: '2024' },
      { label: '据点', value: '河北·曹妃甸' },
      { label: '团队', value: '13+' },
      { label: '形态', value: '线上企业' },
    ],
    coord: '39.27N 118.45E',
    note: '一家充满活力的线上企业，产品研发与社区运营均通过线上协作完成。',
  },
};