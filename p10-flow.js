(() => {
  const stage = document.querySelector('#stepStage');
  const buttons = [...document.querySelectorAll('#fiveFlow [data-step]')];
  if (!stage || !buttons.length) return;

  const gallerySteps = {
    1: {
      title: '推广数据',
      note: '先选出高点击率素材，让 AI 分析有效构图的共性。',
      className: '',
      items: [
        ['p10/data-ctr-2.1.jpg', 'CTR 2.1%'],
        ['p10/data-ctr-2.5.jpg', 'CTR 2.5%'],
        ['p10/data-ctr-2.6.jpg', 'CTR 2.6%'],
        ['p10/data-ctr-2.7.jpg', 'CTR 2.7%']
      ]
    },
    4: {
      title: '生图工作流',
      note: '将 AI 输出的规则带回构图、生成和设计收口环节。',
      className: 'p10-gallery--workflow',
      items: [
        ['p10/workflow-01.png', '设计过程 01'],
        ['p10/workflow-02.png', '设计过程 02'],
        ['p10/workflow-03.png', '设计过程 03'],
        ['p10/workflow-04.png', '设计过程 04']
      ]
    },
    5: {
      title: '新图上线',
      note: '统一输出新一轮素材，再次回到投放端验证。',
      className: '',
      items: [
        ['p10/online-01.jpg', '新图 01'],
        ['p10/online-02.jpg', '新图 02'],
        ['p10/online-03.jpg', '新图 03'],
        ['p10/online-04.jpg', '新图 04']
      ]
    }
  };

  const promptSteps = {
    2: {
      title: 'AI分析结果',
      note: '把高表现素材转换为 AI 可执行的分析任务。',
      cards: [
        {
          label: 'REFERENCE PROMPT / 01',
          title: '定义分析对象与任务',
          body: '<p><strong>参考提示词：</strong>以上是【品牌 / 品类】在【平台】中具有高展现率、高点击率以及高 CTR 的推广图。请分析以上推广图的构图方式与视觉共性，并总结出能够指导 AI 工具生成同类高表现推广图的关键词和关键句。</p><p><strong>输出要求：</strong>明确具体产品、数量、摆放方式、画面层级和相机拍摄角度。可同时提供产品与礼盒参考图。</p>'
        },
        {
          label: 'PRODUCT DEFINITION / 02',
          title: '把抽象共性变成具体画面',
          body: '<p><strong>产品示例：</strong>一瓶 100ml 香水、一支白色 50ml 身体乳、一个 7ml 香水小样，以及二至三个白色礼盒。</p><p><strong>摆放示例：</strong>一个礼盒打开展示，100ml 香水、7ml 香水小样和 50ml 身体乳放置在打开的礼盒中；其他礼盒用于展示或垫高。相机使用微俯视或 45 度角。</p>'
        }
      ]
    },
    3: {
      title: '得到新图提示词',
      note: '将分析结果整理为可直接用于生图的两个版本。',
      cards: [
        {
          label: 'STRICT PROMPT / 精准版',
          title: '锁定构图、数量与摆放',
          body: '<p>一张从 45 度微俯视角度拍摄的高级商业静物摄影图。前景中，一个打开的白色礼盒内放置着一瓶透明玻璃香水、一支白色的 50ml 身体乳和一个 7ml 香水小样。两至三个闭合的白色礼盒摆放在后方和底部，用于垫高和展示。一条白色丝带随意散落在画面中。极简且优雅的构图，层次分明。背景采用柔软、带有纹理的亚麻和棉布等面料，呈现奶油色和米白色等中性色调。柔和的自然晨光照亮画面，产生柔和的阴影，营造舒适、放松且奢华的氛围。高分辨率、逼真、干净的美学风格，顶部留有空白区域用于添加文字。</p>'
        },
        {
          label: 'CREATIVE PROMPT / 创意版',
          title: '在关键条件上增加氛围细节',
          body: '<p>一张从完美的 45 度俯视角度拍摄的高端、逼真的商业静物摄影图。视觉焦点是一个精美的打开的白色礼盒，里面陈列着一瓶纯净的透明玻璃香水、一支光滑的白色身体乳和一支精致的香水小样。围绕并垫高这个主要展示区的是两至三个崭新、闭合的白色礼盒，营造精致、多层次的构图。一条奢华、丝滑的白色丝带毫不费力地倾泻在整个场景中，增添流动的优雅。背景由垂坠感极佳、质地柔软的亚麻和棉质面料组成，呈现奶油色、象牙色和米白色等中性色调。沐浴在柔和晨光那种空灵、漫反射的光晕中，投射出柔和、拉长的阴影，强调材质纹理，营造宁静、舒适且极其奢华的氛围。8K 分辨率、超高细节，顶部留有充足留白以便进行优雅排版。</p>'
        }
      ]
    }
  };

  const intro = (step, title, note) => `<div class="p10-stage__intro"><span>STEP ${String(step).padStart(2, '0')}</span><h3>${title}</h3><p>${note}</p></div>`;
  const renderGallery = (step, data) => {
    const figures = data.items.map(([src, label], index) => `<figure><div class="p10-gallery__media"><img src="./assets/${src}" alt="${data.title} ${index + 1}"></div><figcaption><span>${String(index + 1).padStart(2, '0')}</span><b>${label}</b></figcaption></figure>`).join('');
    stage.innerHTML = `${intro(step, data.title, data.note)}<div class="p10-gallery ${data.className}">${figures}</div>`;
  };
  const renderPrompt = (step, data) => {
    const cards = data.cards.map(card => `<article class="p10-prompt-card"><span>${card.label}</span><h4>${card.title}</h4>${card.body}</article>`).join('');
    stage.innerHTML = `${intro(step, data.title, data.note)}<div class="p10-prompt-document">${cards}</div>`;
  };
  const render = step => {
    buttons.forEach(button => button.classList.toggle('active', Number(button.dataset.step) === step));
    stage.className = 'step-stage active p10-stage';
    if (gallerySteps[step]) renderGallery(step, gallerySteps[step]);
    else renderPrompt(step, promptSteps[step]);
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('copy-editing')) {
      const targets = stage.querySelectorAll('.p10-stage__intro>*,.p10-gallery figure,.p10-prompt-card');
      gsap.killTweensOf(targets);
      gsap.fromTo(targets,{y:14,opacity:0},{y:0,opacity:1,duration:.42,stagger:.055,ease:'power3.out',clearProps:'transform,opacity'});
    }
  };

  buttons.forEach(button => { button.onclick = () => render(Number(button.dataset.step)); });
  render(1);
})();
