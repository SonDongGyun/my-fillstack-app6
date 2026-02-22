module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    items: [
      {
        title: "다비치안경 공식 사이트",
        summary: "현재 뉴스 API가 미연동 상태여서 공식 사이트 링크를 제공합니다.",
        url: "https://www.davich.com/",
        publisher: "Davich",
        published_at: new Date().toISOString()
      },
      {
        title: "다비치마켓",
        summary: "앱/상품 관련 최신 정보는 다비치마켓에서 확인할 수 있습니다.",
        url: "https://www.davichmarket.com/",
        publisher: "Davich Market",
        published_at: new Date().toISOString()
      },
      {
        title: "기업 소개",
        summary: "기업 및 브랜드 소개 페이지입니다.",
        url: "https://davich.com/about/information",
        publisher: "Davich",
        published_at: new Date().toISOString()
      }
    ]
  });
};
