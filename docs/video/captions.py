"""Caption text (script spelling, bracket tags removed) with timings from whisper segments. Writes captions.srt and
caption PNGs + clips/caps/list.txt (concat list with durations) for overlay."""
import os
from PIL import Image, ImageDraw, ImageFont

CAPS = [
(0.0, 3.4, "11 na ng gabi. Bukas na ang pasahan."),
(3.8, 5.0, "Ay Diyos ko!"),
(5.7, 9.3, "At wala ka pa ring term paper para sa major class mo."),
(9.6, 11.7, "O baka naman, bagsak ka na sa Calculus,"),
(11.7, 15.9, "at kailangan mo ng tutor na hindi ka mahihilo sa laki ng gastos."),
(17.4, 19.4, "Been there, done that."),
(19.8, 22.6, "Sa ngayon, ganito ang nakasanayan."),
(23.0, 25.9, "Magpo-post sa Facebook group. Maghihintay."),
(26.3, 28.4, "Mag-ta-tag-tag ng kung sino-sino."),
(28.4, 32.2, "At kapag may sumagot, hindi mo pa alam kung totoo ba siya,"),
(32.3, 34.8, "magaling ba siya, o baka..."),
(34.8, 36.4, "ghoster lang pala."),
(36.5, 39.0, "Ang oras na ginugol ay parang napunta lang sa wala!"),
(39.3, 41.6, "Walang review! Walang kasiguraduhan!"),
(41.8, 43.3, "Akala mo lang wala!"),
(43.5, 46.4, "PERO MERON! MERON! MERON!"),
(46.7, 49.9, "Paano kung may isang lugar, na para sa atin mismo?"),
(50.2, 52.0, "Ito ang Campus Gigs!"),
(52.3, 56.3, "Ang all-in-one marketplace na ginawa ng mga estudyante ng SLSU,"),
(56.3, 58.8, "para sa mga estudyante ng SLSU."),
(59.3, 63.1, "Pagbungad sa'yo ng homepage, alam mo na agad kung ano ang gagawin."),
(63.3, 65.9, "Malinis. Malinaw. Walang hassle."),
(66.3, 69.1, "May anim kang categories na pwede mong pagpilian:"),
(69.3, 72.0, "Design & Creative, Tech & Development,"),
(72.4, 76.7, "Writing & Editing, Tutoring, Admin Support, at iba pa."),
(77.0, 80.2, "Pumili ka lang. O kaya, mag-type sa search bar."),
(80.3, 82.2, "Gusto mo ng pinakamataas ang rating?"),
(82.2, 84.6, "Pinakamura? Pinakamabilis?"),
(84.8, 86.0, "Isang pindot lang!"),
(86.3, 87.7, "Ang pinakamagandang parte?"),
(88.1, 93.2, "Bawat Pay-Yuyan ay beripikadong estudyante ng SLSU."),
(93.3, 95.7, "Hindi basta-bastang estranghero sa internet."),
(95.9, 97.5, "Maaaring kaklase mo siya,"),
(97.7, 100.6, "kapitbahay sa dorm, o kakilala ng kakilala mo."),
(100.9, 102.3, "At bago ka pa magdesisyon,"),
(102.7, 106.0, "nakikita mo na ang mga proyekto o portfolio ng Pay-Yuyan,"),
(106.1, 107.9, "ang bilang ng araw ng paggawa,"),
(107.9, 111.4, "at ang tapat na mga review mula sa mga tunay na estudyante."),
(111.4, 113.3, "Nahanap mo na ang hinahanap mo?"),
(113.6, 116.9, "Kausapin mo nang direkta ang Pay-Yuyan sa mismong website."),
(117.1, 122.2, "Pag-usapan ang detalye, piliin ang proyekto, at mag-order, sa ilang pindot lang."),
(122.5, 124.3, "Masusubaybayan mo ang order mo,"),
(124.4, 127.2, "mula sa araw at oras na ginagawa ang proyekto"),
(127.2, 128.9, "hanggang sa matapos ito."),
(128.9, 132.9, "At ang bayad? Sa meet-up, face-to-face, at sa loob ng kampus."),
(133.3, 136.8, "Walang kumplikadong checkout. Walang card. Walang kaba!"),
(137.2, 139.9, "Pagkatapos, mag-iwan ka ng tapat na review"),
(139.9, 142.3, "para makatulong sa susunod na estudyante."),
(142.5, 143.8, "At ikaw, Pay-Yuyan?"),
(144.1, 146.0, "Alam mong magaling kang mag-edit."),
(146.0, 148.5, "Magdisenyo. Mag-code. Magturo."),
(148.8, 151.1, "Bakit hindi mo pagkakitaan ang talento mo?"),
(151.3, 155.6, "Sa Gig page ay mag-post at ilalagay mo lang ang title ng iyong serbisyo"),
(155.6, 156.9, "na gusto mong i-advertise,"),
(157.1, 160.2, "category, description, at mga kasanayan mo."),
(160.5, 163.1, "Hanggang tatlong proyekto ang puwede mong i-set:"),
(163.3, 165.6, "Basic, Standard, at Pro."),
(165.9, 167.1, "At habang nagta-type ka,"),
(167.1, 169.8, "may live preview na agad"),
(169.8, 172.1, "kung paano lalabas ang gig mo sa Browse."),
(173.1, 174.5, "Walang hulaan."),
(174.7, 176.0, "Kitang-kita mo na."),
(176.3, 179.1, "Kumpara sa Facebook groups at sa sabi-sabi lang,"),
(179.3, 182.1, "ang Campus Gigs ay may beripikadong estudyante,"),
(182.1, 185.2, "pagsubaybay sa order, rating at review,"),
(185.2, 186.9, "at bayad sa meet-up."),
(187.6, 189.8, "Lahat, nasa iisang lugar!"),
(190.2, 194.1, "May halos 455 plus and counting gigs na"),
(194.1, 196.0, "ang naka-post sa Campus Gigs."),
(196.0, 197.7, "At ang karaniwang rating?"),
(198.0, 201.3, "4.8 to a perfect 5 star reviews!"),
(201.6, 205.2, "9 sa bawat 10 buyer, nakahanap ng Pay-Yuyan"),
(205.2, 206.8, "sa loob lang ng isang araw."),
(207.8, 209.2, "Isang araw!"),
(210.1, 211.7, "Libre ang magsimula."),
(212.4, 216.4, "Ang Basic na plano ay libre para sa mamimili at nagbebenta."),
(216.8, 218.8, "Kung gusto mo ng dagdag na benepisyo,"),
(218.9, 222.1, "may Campus Plus na ₱99 kada buwan"),
(222.1, 223.9, "para sa mga mamimili."),
(223.9, 227.8, "At Pro Seller na ₱149 kada buwan,"),
(227.8, 230.8, "na wala nang service fee, para sa mga nagbebenta."),
(231.3, 234.0, "Ang Campus Gigs ay hindi lang basta website."),
(234.5, 235.8, "Isa itong komunidad."),
(236.3, 239.7, "Kung saan ang galing ng bawat estudyante ng SLSU"),
(239.7, 241.5, "ay may espasyo para lumago."),
(241.8, 245.5, "Kung saan ang tulong ay hindi kailangang hanapin sa malayo."),
(245.9, 247.4, "Nasa tabi mo lang."),
(247.7, 248.9, "Campus Gigs!"),
(249.1, 251.4, "Humanap ng mahuhusay na estudyante."),
(251.4, 254.3, "Tapusin ang gawain, dahil sa Quezon..."),
(254.8, 255.9, "WALANG TAMAD!"),
(256.7, 258.1, "Maraming salamat po!"),
(258.5, 260.9, "Paalala: para sa project na ito,"),
(261.0, 262.8, "demo lang ang lahat ng presyo."),
(263.0, 264.8, "Walang totoong perang kinukuha."),
]

def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

if __name__ == "__main__":
    with open("captions.srt", "w") as f:
        for i, (a, b, t) in enumerate(CAPS, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
    os.makedirs("clips/caps", exist_ok=True)
    W, H = 1920, 1080
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 54)
    blank = Image.new("RGBA", (W, H), (0, 0, 0, 0)); blank.save("clips/caps/blank.png")
    lines = []; t_prev = 0.0
    def gap(d):
        if d > 0.001: lines.append(f"file 'blank.png'\nduration {d:.3f}")
    for i, (a, b, t) in enumerate(CAPS):
        gap(a - t_prev)
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        tw = d.textlength(t, font=font); x = (W - tw) / 2; y = H - 150
        d.rounded_rectangle([x - 34, y - 14, x + tw + 34, y + 76], radius=22, fill=(8, 22, 26, 205))
        d.text((x, y), t, font=font, fill=(255, 255, 255, 255))
        im.save(f"clips/caps/c{i:03d}.png")
        lines.append(f"file 'c{i:03d}.png'\nduration {b - a:.3f}"); t_prev = b
    gap(264.9 - t_prev)
    lines.append("file 'blank.png'")
    open("clips/caps/list.txt", "w").write("\n".join(lines) + "\n")
    print(len(CAPS), "captions")
