export const Language = {
    'zh-CN': {
        'capture_as_image': '截取为图片',
        'capture_entire_page': '截取整个页面',
        'select_as_element': '选择元素',
        'select_area': '选择区域',
        'select_a_language': '选择语言',
    },
    // traditional chinese
    'zh-TW': {
        'capture_as_image': '截取為圖片',
        'capture_entire_page': '截取整個頁面',
        'select_as_element': '選擇元素',
        'select_area': '選擇區域',
        'select_a_language': '選擇語言',
    },
    // japanese
    'ja': {
        'capture_as_image': '画像としてキャプチャ',
        'capture_entire_page': 'ページ全体をキャプチャ',
        'select_as_element': '要素を選択',
        'select_area': 'エリアを選択',
        'select_a_language': '言語を選択',
    },
    // korean
    'ko': {
        'capture_as_image': '이미지로 캡처',
        'capture_entire_page': '전체 페이지 캡처',
        'select_as_element': '요소 선택',
        'select_area': '영역 선택',
        'select_a_language': '언어 선택',
    },
    // french
    'fr': {
        'capture_as_image': 'Capturer comme image',
        'capture_entire_page': 'Capturer la page entière',
        'select_as_element': 'Sélectionner un élément',
        'select_area': 'Sélectionner une zone',
        'select_a_language': 'Choisir une langue',
    },
    // spanish
    'es': {
        'capture_as_image': 'Capturar como imagen',
        'capture_entire_page': 'Capturar página completa',
        'select_as_element': 'Seleccionar elemento',
        'select_area': 'Seleccionar área',
        'select_a_language': 'Seleccionar un idioma',
    },
    // german
    'de': {
        'capture_as_image': 'Als Bild erfassen',
        'capture_entire_page': 'Gesamte Seite erfassen',
        'select_as_element': 'Element auswählen',
        'select_area': 'Bereich auswählen',
        'select_a_language': 'Sprache auswählen',
    },
    // italian
    'it': {
        'capture_as_image': 'Cattura come immagine',
        'capture_entire_page': 'Cattura l\'intera pagina',
        'select_as_element': 'Seleziona elemento',
        'select_area': 'Seleziona area',
        'select_a_language': 'Seleziona una lingua',
    },
    // portuguese
    'pt': {
        'capture_as_image': 'Capturar como imagem',
        'capture_entire_page': 'Capturar página inteira',
        'select_as_element': 'Selecionar elemento',
        'select_area': 'Selecionar área',
        'select_a_language': 'Selecione um idioma',
    },
    // russian
    'ru': {
        'capture_as_image': 'Захватить как изображение',
        'capture_entire_page': 'Захватить всю страницу',
        'select_as_element': 'Выбрать элемент',
        'select_area': 'Выбрать область',
        'select_a_language': 'Выберите язык',
    },
    // arabic
    'ar': {
        'capture_as_image': 'التقاط صورة',
        'capture_entire_page': 'التقاط صفحة كاملة',
        'select_as_element': 'تحديد العنصر',
        'select_area': 'تحديد المنطقة',
        'select_a_language': 'اختر لغة',
    },
    // hindi
    'hi': {
        'capture_as_image': 'छवि के रूप में कैप्चर',
        'capture_entire_page': 'पूरे पृष्ठ को कैप्चर करें',
        'select_as_element': 'एलिमेंट का चयन करें',
        'select_area': 'क्षेत्र का चयन करें',
        'select_a_language': 'भाषा चुनें',
    },
    // thai
    'th': {
        'capture_as_image': 'จับภาพเป็นภาพ',
        'capture_entire_page': 'จับภาพหน้าทั้งหมด',
        'select_as_element': 'เลือกองค์ประกอบ',
        'select_area': 'เลือกพื้นที่',
        'select_a_language': 'เลือกภาษา',
    },
    // vietnamese
    'vi': {
        'capture_as_image': 'Chụp ảnh',
        'capture_entire_page': 'Chụp toàn bộ trang',
        'select_as_element': 'Chọn phần tử',
        'select_area': 'Chọn khu vực',
        'select_a_language': 'Chọn ngôn ngữ',
    },
    // indonesian
    'id': {
        'capture_as_image': 'Tangkap sebagai gambar',
        'capture_entire_page': 'Tangkap seluruh halaman',
        'select_as_element': 'Pilih elemen',
        'select_area': 'Pilih area',
        'select_a_language': 'Pilih bahasa',
    },
    // malay
    'ms': {
        'capture_as_image': 'Tangkap sebagai imej',
        'capture_entire_page': 'Tangkap seluruh halaman',
        'select_as_element': 'Pilih elemen',
        'select_area': 'Pilih kawasan',
        'select_a_language': 'Pilih bahasa',
    },
    // english
    'en': {
        'capture_as_image': 'Capture as image',
        'capture_entire_page': 'Capture entire page',
        'select_as_element': 'Select element',
        'select_area': 'Select area',
        'select_a_language': 'Select a language',
    },
}

export const getLanguage = (lang: string) => {
    // get lang in Language object
    const keys = Object.keys(Language) as Array<keyof typeof Language>;
    // need to check contains
    const index = keys.findIndex((l: string) => lang.toLowerCase().includes(l.toLowerCase()));
    if (index === -1) {
        return Language['en'];
    }
    return Language[keys[index]];
}