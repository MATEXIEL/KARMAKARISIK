const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Ses dosyalarının yüklenmesi
const backgroundMuzik = document.getElementById("bg-music");
const dogruCevapSes = document.getElementById("success-sound");
const gameOverMuzik = document.getElementById("gameover-sound");

// Arkaplan resimlerinin yüklenmesi
const backgroundResimler = ["img/light-bg.jpg", "img/dark-bg.jpg"];
let backgroundIndex = 0;
let backgroundResmi = new Image();
backgroundResmi.src = backgroundResimler[backgroundIndex];

// Burada rastgele kelimeler seçilmesi için bir kütüphane kullanılabilirdi ancak proje tanımında belirtilmediği için
// basit bir kelime listesi manuel olarak tanımlandı.
const kelimeListesi = ["apple", "banana", "grape", "melon", "kiwi", "orange", "lemon", "peach", "berry", "cherry", 
               "plum", "pear", "mango", "papaya", "pineapple", "coconut", "apricot", "fig", "date", "tangerine", 
               "pomegranate", "watermelon", "blueberry", "raspberry", "accident", "adventure", "beautiful",
               "challenge", "delicious", "education", "fantastic", "gorgeous", "happiness", "imagination", 
               "car", "bike", "train", "airplane", "boat", "rocket", "computer", "phone", "television"];
let secilenKelime = "";
let oyuncuGirdi = "";
let kurallar = [];
let puan = 0;
let kalanSure = 10;
let sayac;
let gameOver = false;
let gameStarted = false;

// Oyunun mekaniğinde kullanılacak fonksiyonlar
// Aşağıdaki fonksiyon yazıların her iki arkaplanda da okunabilirliğini artırmak için tanımlandı
function highlightedTextYaz(text, x, y, size = 30, color = "#fff") {
  ctx.font = `${size}px Arial`;
  const padding = 10;
  const textWidth = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x - padding / 2, y - size + 5, textWidth + padding, size + 10);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Buton ekleme fonksiyonu
// Butonları normal bir şekilde eklediğimde canvas dışına çıkıyordu, ben de o yüzden bu fonksiyonu tanımladım
function butonEkle(text, x, y, width, height) {
  ctx.fillStyle = "#444";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(text, x + 10, y + 30);
}

// Oyunun mekaniği gereği harflerin değişimini uygulayan fonksiyon
function harfDegistir(char) {
  for (const [a, b] of kurallar) {
    if (char === a) return b;
    if (char === b) return a;
  }
  return char;
}

// Yukarıdaki fonksiyonun tersini uygulayan fonksiyon
function tersiniYolla(char) {
  for (const [a, b] of kurallar) {
    if (char === b) return a;
    if (char === a) return b;
  }
  return char;
}

function donusmusInput(input) {
  return input.split("").map(harfDegistir).join("");
}

function gosterilenInput(input) {
  return input.split("").map(tersiniYolla).join("");
}

// Her 5 doğru cevapta yeni bir kural ekleyen fonksiyon
function yeniKuralEkle() {
  const alfabe = "abcdefghijklmnopqrstuvwxyz".split("");
  let a, b;
  do {
    a = alfabe[Math.floor(Math.random() * alfabe.length)];
    b = alfabe[Math.floor(Math.random() * alfabe.length)];
  } while (
    a === b ||
    kurallar.some(rule => rule.includes(a) || rule.includes(b))
  );
  kurallar.push([a, b]);
}

// Oyunu sıfırlayan fonksiyon
function oyunuSifirla() {
  secilenKelime = kelimeListesi[Math.floor(Math.random() * kelimeListesi.length)];
  oyuncuGirdi = "";
  kalanSure = 10;
  canvasGuncelle();
  sayacBaslat();
}

// Kalan süreyi kontrol eden ve oyunu bitiren fonksiyon
function sayacBaslat() {
  clearInterval(sayac);
  sayac = setInterval(() => {
    kalanSure--;
    if (kalanSure <= 0) {
      clearInterval(sayac);
      oyunBitti();
    }
    canvasGuncelle();
  }, 1000);
}

// Oyunun bitiş ile alakalı işlemleri yapan fonksiyon
function oyunBitti() {
  gameOver = true;
  backgroundMuzik.pause();
  gameOverMuzik.play();
  canvasGuncelle();
}

// Canvas üzerindeki değişiklikleri yapan fonksiyon
function canvasGuncelle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundResmi, 0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    highlightedTextYaz("Karmakarışık'a Hoş Geldin!", 200, 150, 30);
    highlightedTextYaz("Kurallar:", 200, 200, 20);
    highlightedTextYaz("- Ekranda çıkan kelimeyi doğru bir şekilde yazmaya çalış.", 200, 230, 20);
    highlightedTextYaz("- Harfler rastgele olarak değişecek!", 200, 260, 20);
    highlightedTextYaz("- Her 5 puanda bir yeni kural eklenir.", 200, 290, 20);
    highlightedTextYaz("- Oyuna başlamak için butona tıkla!", 200, 320, 20);
    
    butonEkle("Oyuna Başla", 300, 400, 200, 50);
  } else {
    highlightedTextYaz(`Yazılacak Kelime: ${secilenKelime}`, 50, 80);
    highlightedTextYaz(`Yazılan: ${gosterilenInput(oyuncuGirdi)}`, 50, 130);
    highlightedTextYaz(`Kalan Süre: ${kalanSure}s`, 50, 180);
    highlightedTextYaz(`Puan: ${puan}`, 50, 230);

    highlightedTextYaz("Kurallar:", 600, 60, 20);
    kurallar.forEach(([a, b], i) => {
      highlightedTextYaz(`${a} ↔ ${b}`, 600, 90 + i * 30, 20);
    });

    butonEkle("Karanlık Mod'a Geç", 300, 450, 200, 50);

    if (gameOver) {
      highlightedTextYaz("OYUN BİTTİ", 280, 400, 40, "#ff3333");
    }
  }
}

// Tuş basma ve tıklama olaylarını dinleyen fonksiyon
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // "Oyuna Başla" butonuna tıklama kontrolü
  if (!gameStarted && x >= 300 && x <= 500 && y >= 400 && y <= 450) {
    backgroundMuzik.volume = 0.3;
    backgroundMuzik.play();
    gameStarted = true;
    yeniKuralEkle();
    oyunuSifirla();
    canvasGuncelle();
  }

  // "Karanlık Mod'a Geç" butonuna tıklama kontrolü
  if (gameStarted && x >= 300 && x <= 500 && y >= 450 && y <= 500) {
    backgroundIndex = (backgroundIndex + 1) % backgroundResimler.length;
    backgroundResmi.src = backgroundResimler[backgroundIndex];
    canvasGuncelle();
  }
});

// Oyuncu girdisini dinleyen ve işleyen event listener 
document.addEventListener("keydown", (e) => {
  if (gameOver || !gameStarted) return;

  const key = e.key.toLowerCase();
  if (key === "backspace") {
    oyuncuGirdi = oyuncuGirdi.slice(0, -1);
  } else if (/^[a-z]$/.test(key)) {
    oyuncuGirdi += key;
  }

  canvasGuncelle();

  if (donusmusInput(oyuncuGirdi) === secilenKelime) {
    dogruCevapSes.play();
    puan++;
    if (puan % 5 === 0) yeniKuralEkle(); // Her 5 puanda yeni kural ekle
    setTimeout(oyunuSifirla, 300);
  }
});

backgroundResmi.onload = () => {
  canvasGuncelle();
};