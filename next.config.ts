import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        /*
         * 全ページを noindex にする。
         *
         * この画面の事業者は架空である。社名は実在の事業者と衝突しないか
         * 調べて付けたものだが、検索結果に出てしまえば「実在しない店の
         * 公式サイト」として読まれうる。だから配信する以上は必ず外す。
         *
         * robots.txt で Disallow しないこと。Disallow するとクローラが
         * この noindex を読めず、URL だけがインデックスされうる。
         */
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noimageindex, noarchive',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
