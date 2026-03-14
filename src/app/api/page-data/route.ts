import { NextResponse } from 'next/server'

const avatarList = [
  {
    image: '/images/home/avatar_1.jpg',
    title: 'Sarah Johnson',
  },
  {
    image: '/images/home/avatar_2.jpg',
    title: 'Olivia Miller',
  },
  {
    image: '/images/home/avatar_3.jpg',
    title: 'Sophia Roberts',
  },
  {
    image: '/images/home/avatar_4.jpg',
    title: 'Isabella Clark',
  },
]

const brandList = [
  {
    image: '/images/home/brand/zarme-light.svg',
    darkImg: '/images/home/brand/zarme-dark.svg',
    title: 'Zarme Atelier',
  },
  {
    image: '/images/home/brand/elhnon-light.svg',
    darkImg: '/images/home/brand/elhnon-dark.svg',
    title: 'Elhnon Odnufmon',
  },
  {
    image: '/images/home/brand/squarre-light.svg',
    darkImg: '/images/home/brand/squarre-dark.svg',
    title: 'Squarredesk',
  },
  {
    image: '/images/home/brand/procuremax-light.svg',
    darkImg: '/images/home/brand/procuremax-dark.svg',
    title: 'Procuremax',
  },
  {
    image: '/images/home/brand/logo5.png',
    darkImg: '/images/home/brand/logo5dark.png',
    title: 'CN Enterprises',
  },
]

const innovationList = [
  {
    image: '/images/home/innovation/brand.svg',
    title: 'Brand\nStrategy',
    bg_color: 'bg-purple/20',
    txt_color: 'text-purple',
  },
  {
    image: '/images/home/innovation/digitalmarketing.svg',
    title: 'Digital\nMarketing',
    bg_color: 'bg-blue/20',
    txt_color: 'text-blue',
  },
  {
    image: '/images/home/innovation/uiux.svg',
    title: 'SEO\nManagement',
    bg_color: 'bg-orange/20',
    txt_color: 'text-orange',
  },
  {
    image: '/images/home/innovation/analitics.svg',
    title: 'Analytics &\nReporting',
    bg_color: 'bg-green/20',
    txt_color: 'text-green',
  },
  {
    image: '/images/home/innovation/webdevp.svg',
    title: 'Website\nDevelopment',
    bg_color: 'bg-pink/20',
    txt_color: 'text-pink',
  },
  {
    image: '/images/home/innovation/analitics.svg',
    title: 'Finance &\nReporting',
    bg_color: 'bg-green/20',
    txt_color: 'text-green',
  },
  {
    image: '/images/home/innovation/brand.svg',
    title: 'Community\nMarketplace',
    bg_color: 'bg-purple/20',
    txt_color: 'text-purple',
  },
  {
    image: '/images/home/innovation/webdevp.svg',
    title: 'Staff\nManagement',
    bg_color: 'bg-pink/20',
    txt_color: 'text-pink',
  },
]

const onlinePresenceList = [
  {
    image: '/images/home/onlinePresence/online_img_1.jpg',
    title: 'Manage finances',
    tag: ['Invoices', 'Payment Integrations'],
    link: 'https://squarredesk.vercel.app',
  },
  {
    image: '/images/home/onlinePresence/online_img_2.jpg',
    title: 'Build websites',
    tag: ['100+ Templates', 'Traffic Metrics'],
    link: 'https://squarredesk.vercel.app',
  },
  {
    image: '/images/home/onlinePresence/online_img_3.jpg',
    title: 'Design Selling Products',
    tag: ['Brand identity design', 'UX Research'],
    link: 'https://squarredesk.vercel.app',
  },
  {
    image: '/images/home/onlinePresence/online_img_4.jpg',
    title: 'Collaborate With Leaders',
    tag: ['Vendor Database', 'Staff Accounts'],
    link: 'https://squarredesk.vercel.app',
  },
]

const creativeMindList = [
  {
    image: '/images/home/creative/creative_img_1.png',
    name: 'Thubelihle Zulu',
    position: 'CEO',
    twitterLink: 'https://x.com/',
    linkedinLink: 'https://www.linkedin.com/in/thubelihle-zulu-6310581a6/',
  },
  {
    image: '/images/home/creative/creative_img_2.png',
    name: 'Nomfundo Sithole',
    position: 'Vice President',
    twitterLink: 'https://x.com/',
    linkedinLink: 'https://in.linkedin.com/',
  },
  {
    image: '/images/home/creative/creative_img_3.png',
    name: 'Brian Hlalani',
    position: 'UI Designer',
    twitterLink: 'https://x.com/',
    linkedinLink: 'https://in.linkedin.com/',
  },
  {
    image: '/images/home/creative/creative_img_4.png',
    name: 'Nolwandle Mthembu',
    position: 'Brand Strategist',
    twitterLink: 'https://x.com/',
    linkedinLink: 'https://in.linkedin.com/',
  },
]

const WebResultTagList = [
  {
    image: '/images/home/result/creativity.svg',
    name: 'Creativity',
    bg_color: 'bg-purple/20',
    txt_color: 'text-purple',
  },
  {
    image: '/images/home/result/innovation.svg',
    name: 'Innovation',
    bg_color: 'bg-blue/20',
    txt_color: 'text-blue',
  },
  {
    image: '/images/home/result/strategy.svg',
    name: 'Strategy',
    bg_color: 'bg-orange/20',
    txt_color: 'text-orange',
  },
]

const startupPlanList = [
  {
    plan_bg_color: 'bg-pale-yellow',
    text_color: 'text-dark_black',
    descp_color: 'dark_black/60',
    border_color: 'border-dark_black/10',
    plan_name: 'Free',
    plan_descp: 'For businesses just starting or testing an idea.',
    plan_price: 'R0',
    icon_img: '/images/home/startupPlan/white_tick.svg',
    plan_feature: [
      'Free website',
      'Access to 100+ templates',
      'Community support',
      'Monthly analytics',
      'Marketplace Access',
      'Collaboration Support',
    ],
  },
  {
    plan_bg_color: 'bg-purple_blue',
    text_color: 'text-white',
    descp_color: 'white/60',
    border_color: 'border-white/10',
    plan_name: 'Basic',
    plan_descp: '2x the speed. Great for an MVP, Web App or complex problem',
    plan_price: 'R49',
    icon_img: '/images/home/startupPlan/black_tick.svg',
    plan_feature: [
      '3 Free website',
      'Access premium templates',
      'Community support',
      'Instant analytics',
      'SEO Tools',
      'Staff Accounts',
    ],
  },
]

const faqList = [
  {
    faq_que: 'What exactly is Squarre?',
    faq_ans:
      'Squarre is an all-in-one business platform built for South African entrepreneurs. Instead of paying for multiple tools, Squarre gives you everything in one place — website building, accounting tools, SEO insights, social media marketing tools, project collaboration, and access to a vendor marketplace. It is designed to help you launch, manage, and grow your business without needing expensive software or technical skills.',
  },
  {
    faq_que: 'Is Squarre really free to start?',
    faq_ans:
      'Yes. Squarre offers a free plan so anyone can start building their business without financial pressure. As your business grows, you can upgrade to affordable paid plans starting at R49 per month, unlocking additional features and capabilities. We believe access to business tools shouldn’t depend on how much money you have.',
  },
  {
    faq_que: 'How is Squarre different from platforms like Shopify or Wix?',
    faq_ans:
      'Platforms like Shopify and Wix are powerful, but they’re built primarily for global markets and often require multiple paid tools to run a business properly. Squarre is designed specifically for the South African entrepreneur, offering more affordable pricing, built-in business tools beyond just websites, community support and collaboration, vendor marketplace access, simple accounting tools for tracking income and expenses. Instead of using 5 different platforms, Squarre gives you one place to run your business.',
  },
  {
    faq_que: 'Can I really start a business with Squarre?',
    faq_ans:
      'Yes. Every business starts with an idea. Squarre gives you the tools to turn that idea into something real — even if you are starting with nothing but ambition.',
  },
  {
    faq_que: 'Do I need technical skills to use Squarre?',
    faq_ans:
      'No technical experience is required. Squarre is designed to be simple and intuitive so that anyone can launch a business online. Whether you are starting from your bedroom, running a side hustle, or building a full company, the platform guides you step by step. If you can use a smartphone or social media, you can use Squarre.',
  },
  {
    faq_que: 'What if I’ve never started a business before?',
    faq_ans:
      'That’s exactly who Squarre was built for. Most entrepreneurs do not start with experience — they start with an idea and the willingness to try. Squarre gives you the tools to launch a website, manage tasks, track your money, and promote your business without needing technical knowledge or a big budget. You do not need to know everything to begin. You just need a place to start.',
  },
  {
    faq_que: 'What if my idea doesn’t work?',
    faq_ans:
      'That’s part of the journey. Many successful businesses started as experiments. Squarre lets you test your idea quickly without spending hundreds of rands on expensive software. Because there is a free plan, you can explore, build, and learn without financial pressure. Sometimes the first idea evolves into something even better — and Squarre grows with you along the way.',
  },
]

const achievementsList = [
  {
    icon: '/images/home/achievement/framer_award.svg',
    dark_icon: '/images/home/achievement/dark_framer_award.svg',
    sub_title: 'Small Business Awards',
    title:
      'Celebrated for cutting-edge interaction design and seamless user experiences.',
    year: '2024',
    url: 'https://www.framer.com/',
  },
  {
    icon: '/images/home/achievement/dribble_award.svg',
    dark_icon: '/images/home/achievement/dribble_award.svg',
    sub_title: 'Dribbble Awards',
    title: 'Recognized for creative excellence and innovative design solutions',
    year: '2023',
    url: 'https://dribbble.com/',
  },
  {
    icon: '/images/home/achievement/awward_award.svg',
    dark_icon: '/images/home/achievement/dark_awward_award.svg',
    sub_title: 'awwwards Awards',
    title:
      'Honored with the Best Website Design for creativity, usability, and innovation.',
    year: '2022',
    url: 'https://www.framer.com/',
  },
]


export const GET = async () => {
  return NextResponse.json({
    avatarList,
    brandList,
    innovationList,
    onlinePresenceList,
    creativeMindList,
    WebResultTagList,
    startupPlanList,
    faqList,
    achievementsList,
  });
};
