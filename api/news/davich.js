function stripHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function inferPublisher(urlValue) {
  if (!urlValue) return "Unknown";
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase().replace(/^www\./, "");
    const parts = hostname.split(".").filter(Boolean);
    if (parts.length === 0) return "Unknown";

    const domainCore = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    const map = {
      yna: "연합뉴스",
      yonhapnews: "연합뉴스",
      mt: "머니투데이",
      hankyung: "한국경제",
      mk: "매일경제",
      sedaily: "서울경제",
      fnnews: "파이낸셜뉴스",
      edaily: "이데일리",
      kbs: "KBS",
      mbc: "MBC",
      sbs: "SBS",
      jtbc: "JTBC",
      joongang: "중앙일보",
      donga: "동아일보",
      chosun: "조선일보",
      hani: "한겨레",
      khan: "경향신문",
      newsis: "뉴시스",
      nocutnews: "노컷뉴스",
      naver: "네이버뉴스",
    };

    return map[domainCore] || hostname;
  } catch (_) {
    return "Unknown";
  }
}

function fallbackItems() {
  const now = new Date().toISOString();
  return [
    {
      title: "젠틀몬스터 공식 사이트",
      summary: "뉴스 API 키가 없거나 호출이 실패해 젠틀몬스터 기본 링크를 표시합니다.",
      url: "https://www.gentlemonster.com/kr",
      publisher: "Gentle Monster",
      published_at: now,
    },
    {
      title: "젠틀몬스터 공식 사이트",
      summary: "최신 소식은 젠틀몬스터 공식 페이지에서 확인할 수 있습니다.",
      url: "https://www.gentlemonster.com/kr",
      publisher: "Gentle Monster",
      published_at: now,
    },
    {
      title: "기업 소개",
      summary: "기업 및 브랜드 소개 페이지입니다.",
      url: "https://www.gentlemonster.com/kr",
      publisher: "Gentle Monster",
      published_at: now,
    },
  ];
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(200).json({ items: fallbackItems(), source: "fallback", reason: "missing_env" });
    return;
  }

  const params = new URLSearchParams({
    query: "젠틀몬스터 안경",
    display: "10",
    start: "1",
    sort: "date",
  });

  try {
    const response = await fetch(`https://openapi.naver.com/v1/search/news.json?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`naver_status_${response.status}`);
    }

    const payload = await response.json();
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    const items = rawItems.slice(0, 3).map((item) => {
      const url = item.originallink || item.link || "https://www.gentlemonster.com/kr";
      return {
        title: stripHtml(item.title) || "제목 없음",
        summary: stripHtml(item.description) || "요약 정보가 없습니다.",
        url,
        publisher: inferPublisher(item.originallink || item.link),
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      };
    });

    if (items.length === 0) {
      res.status(200).json({ items: fallbackItems(), source: "fallback", reason: "empty_items" });
      return;
    }

    res.status(200).json({ items, source: "naver" });
  } catch (error) {
    res.status(200).json({
      items: fallbackItems(),
      source: "fallback",
      reason: "request_failed",
      error: String(error && error.message ? error.message : error),
    });
  }
};
