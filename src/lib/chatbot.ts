interface BotResponse {
  keywords: string[]
  reply: string
}

const botResponses: BotResponse[] = [
  { keywords: ['halo', 'hai', 'hi', 'pagi', 'siang', 'malam'], reply: 'Halo! 👋 Selamat datang di ThriftIn. Ada yang bisa saya bantu?' },
  { keywords: ['bayar', 'pembayaran', 'cara bayar'], reply: 'Kami menerima pembayaran via GoPay, OVO, DANA, ShopeePay, BCA, dan Mandiri. Pilih saat checkout ya! 💳' },
  { keywords: ['kirim', 'pengiriman', 'ongkir', 'sampai'], reply: 'Pengiriman gratis ongkir untuk semua pesanan! Estimasi 2-4 hari kerja setelah pembayaran dikonfirmasi. 📦' },
  { keywords: ['kondisi', 'bekas', 'preloved', 'rusak'], reply: 'Semua produk sudah kami cek kualitasnya dan dikategorikan Good, Very Good, atau Like New sesuai kondisi aslinya. ✨' },
  { keywords: ['tawar', 'nego', 'diskon', 'murah'], reply: 'Bisa! Klik tombol "Tawar Harga" di produk yang kamu suka, nanti penjual akan meninjau penawaran kamu. 💬' },
  { keywords: ['retur', 'kembali', 'tukar', 'refund'], reply: 'Untuk retur/refund, mohon hubungi penjual langsung melalui menu "Chat dengan Penjual" di bawah ya. 🙏' },
  { keywords: ['terima kasih', 'makasih', 'thanks'], reply: 'Sama-sama! Senang bisa membantu. Selamat berbelanja! 🛍️' },
]

const defaultReply = 'Maaf, saya belum paham pertanyaan kamu. Coba tanya tentang pembayaran, pengiriman, atau kondisi produk. Atau klik "Chat dengan Penjual" untuk bantuan langsung! 👇'

export function getBotReply(message: string): string {
  const lower = message.toLowerCase()
  for (const item of botResponses) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return item.reply
    }
  }
  return defaultReply
}
