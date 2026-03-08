// Full i18n translation system for World War Royale
// 10 languages: English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese, Arabic, Russian

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'ko' | 'zh' | 'ar' | 'ru';

export const LANGUAGES: { code: Language; name: string; native: string; flag: string }[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
];

type TranslationMap = Record<string, Record<Language, string>>;

const translations: TranslationMap = {
  // ═══ Navigation ═══
  'nav.shop': { en: 'Shop', es: 'Tienda', fr: 'Boutique', de: 'Shop', pt: 'Loja', ja: 'ショップ', ko: '상점', zh: '商店', ar: 'المتجر', ru: 'Магазин' },
  'nav.cards': { en: 'Cards', es: 'Cartas', fr: 'Cartes', de: 'Karten', pt: 'Cartas', ja: 'カード', ko: '카드', zh: '卡牌', ar: 'البطاقات', ru: 'Карты' },
  'nav.battle': { en: 'Battle', es: 'Batalla', fr: 'Combat', de: 'Kampf', pt: 'Batalha', ja: 'バトル', ko: '전투', zh: '战斗', ar: 'المعركة', ru: 'Битва' },
  'nav.social': { en: 'Social', es: 'Social', fr: 'Social', de: 'Sozial', pt: 'Social', ja: 'ソーシャル', ko: '소셜', zh: '社交', ar: 'اجتماعي', ru: 'Соцсеть' },
  'nav.events': { en: 'Events', es: 'Eventos', fr: 'Événements', de: 'Events', pt: 'Eventos', ja: 'イベント', ko: '이벤트', zh: '活动', ar: 'الأحداث', ru: 'События' },

  // ═══ Main Menu ═══
  'menu.battle': { en: 'BATTLE', es: 'BATALLA', fr: 'COMBAT', de: 'KAMPF', pt: 'BATALHA', ja: 'バトル', ko: '전투', zh: '战斗', ar: 'معركة', ru: 'БИТВА' },
  'menu.trophy_road': { en: 'Trophy Road', es: 'Camino de Trofeos', fr: 'Route des Trophées', de: 'Trophäenstraße', pt: 'Estrada dos Troféus', ja: 'トロフィーロード', ko: '트로피 로드', zh: '奖杯之路', ar: 'طريق الكؤوس', ru: 'Дорога трофеев' },
  'menu.events': { en: 'Events', es: 'Eventos', fr: 'Événements', de: 'Events', pt: 'Eventos', ja: 'イベント', ko: '이벤트', zh: '活动', ar: 'الأحداث', ru: 'События' },
  'menu.special_challenge': { en: 'Special Challenge', es: 'Desafío Especial', fr: 'Défi Spécial', de: 'Spezialherausforderung', pt: 'Desafio Especial', ja: '特別チャレンジ', ko: '특별 도전', zh: '特殊挑战', ar: 'تحدي خاص', ru: 'Особый вызов' },
  'menu.mailbox': { en: 'Mailbox', es: 'Buzón', fr: 'Boîte aux lettres', de: 'Postfach', pt: 'Caixa de Correio', ja: 'メールボックス', ko: '우편함', zh: '邮箱', ar: 'صندوق البريد', ru: 'Почта' },
  'menu.messages': { en: 'Messages', es: 'Mensajes', fr: 'Messages', de: 'Nachrichten', pt: 'Mensagens', ja: 'メッセージ', ko: '메시지', zh: '消息', ar: 'الرسائل', ru: 'Сообщения' },
  'menu.war_pass': { en: 'War Pass', es: 'Pase de Guerra', fr: 'Passe de Guerre', de: 'Kriegspass', pt: 'Passe de Guerra', ja: 'ウォーパス', ko: '워패스', zh: '战争通行证', ar: 'تصريح الحرب', ru: 'Военный пропуск' },
  'menu.earn_crowns': { en: 'Earn Crowns', es: 'Ganar Coronas', fr: 'Gagner Couronnes', de: 'Kronen verdienen', pt: 'Ganhar Coroas', ja: '王冠を獲得', ko: '왕관 획득', zh: '获取皇冠', ar: 'اكسب التيجان', ru: 'Заработай короны' },
  'menu.current_deck': { en: 'Current Deck', es: 'Mazo Actual', fr: 'Deck Actuel', de: 'Aktuelles Deck', pt: 'Deck Atual', ja: '現在のデッキ', ko: '현재 덱', zh: '当前卡组', ar: 'المجموعة الحالية', ru: 'Текущая колода' },
  'menu.edit_deck': { en: 'Edit Deck →', es: 'Editar Mazo →', fr: 'Modifier Deck →', de: 'Deck bearbeiten →', pt: 'Editar Deck →', ja: 'デッキ編集 →', ko: '덱 편집 →', zh: '编辑卡组 →', ar: 'تعديل المجموعة →', ru: 'Изменить колоду →' },
  'menu.arena': { en: 'Arena', es: 'Arena', fr: 'Arène', de: 'Arena', pt: 'Arena', ja: 'アリーナ', ko: '아레나', zh: '竞技场', ar: 'الحلبة', ru: 'Арена' },
  'menu.lvl': { en: 'LVL', es: 'NVL', fr: 'NIV', de: 'STF', pt: 'NVL', ja: 'LV', ko: 'LV', zh: '等级', ar: 'مستوى', ru: 'УР' },
  'menu.1v1': { en: '1v1', es: '1v1', fr: '1v1', de: '1v1', pt: '1v1', ja: '1v1', ko: '1v1', zh: '1v1', ar: '1v1', ru: '1v1' },
  'menu.2v2': { en: '2v2', es: '2v2', fr: '2v2', de: '2v2', pt: '2v2', ja: '2v2', ko: '2v2', zh: '2v2', ar: '2v2', ru: '2v2' },
  'menu.party': { en: 'Party', es: 'Fiesta', fr: 'Fête', de: 'Party', pt: 'Festa', ja: 'パーティー', ko: '파티', zh: '派对', ar: 'حفلة', ru: 'Вечеринка' },
  'menu.level_rewards': { en: 'LEVEL REWARDS', es: 'RECOMPENSAS DE NIVEL', fr: 'RÉCOMPENSES DE NIVEAU', de: 'STUFENBELOHNUNGEN', pt: 'RECOMPENSAS DE NÍVEL', ja: 'レベル報酬', ko: '레벨 보상', zh: '等级奖励', ar: 'مكافآت المستوى', ru: 'НАГРАДЫ ЗА УРОВЕНЬ' },
  'menu.xp_progress': { en: 'XP Progress', es: 'Progreso XP', fr: 'Progression XP', de: 'XP-Fortschritt', pt: 'Progresso XP', ja: 'XP進捗', ko: 'XP 진행', zh: 'XP进度', ar: 'تقدم الخبرة', ru: 'Прогресс XP' },
  'menu.claim': { en: 'CLAIM', es: 'RECLAMAR', fr: 'RÉCUPÉRER', de: 'ABHOLEN', pt: 'RESGATAR', ja: '受取', ko: '수령', zh: '领取', ar: 'مطالبة', ru: 'ЗАБРАТЬ' },
  'menu.level_reward_title': { en: '⬆️ Level Reward!', es: '⬆️ ¡Recompensa de Nivel!', fr: '⬆️ Récompense de Niveau!', de: '⬆️ Stufenbelohnung!', pt: '⬆️ Recompensa de Nível!', ja: '⬆️ レベル報酬！', ko: '⬆️ 레벨 보상!', zh: '⬆️ 等级奖励！', ar: '⬆️ مكافأة المستوى!', ru: '⬆️ Награда за уровень!' },
  'menu.you_received': { en: 'You received:', es: 'Recibiste:', fr: 'Vous avez reçu:', de: 'Du hast erhalten:', pt: 'Você recebeu:', ja: '受け取りました：', ko: '받은 보상:', zh: '你获得了：', ar: 'تلقيت:', ru: 'Вы получили:' },

  // ═══ Battle ═══
  'battle.victory': { en: 'VICTORY!', es: '¡VICTORIA!', fr: 'VICTOIRE!', de: 'SIEG!', pt: 'VITÓRIA!', ja: '勝利！', ko: '승리!', zh: '胜利！', ar: 'انتصار!', ru: 'ПОБЕДА!' },
  'battle.defeat': { en: 'DEFEAT', es: 'DERROTA', fr: 'DÉFAITE', de: 'NIEDERLAGE', pt: 'DERROTA', ja: '敗北', ko: '패배', zh: '失败', ar: 'هزيمة', ru: 'ПОРАЖЕНИЕ' },
  'battle.trophies': { en: 'Trophies', es: 'Trofeos', fr: 'Trophées', de: 'Trophäen', pt: 'Troféus', ja: 'トロフィー', ko: '트로피', zh: '奖杯', ar: 'الكؤوس', ru: 'Трофеи' },
  'battle.crowns': { en: 'Crowns', es: 'Coronas', fr: 'Couronnes', de: 'Kronen', pt: 'Coroas', ja: '王冠', ko: '왕관', zh: '皇冠', ar: 'التيجان', ru: 'Короны' },
  'battle.continue': { en: 'Continue', es: 'Continuar', fr: 'Continuer', de: 'Weiter', pt: 'Continuar', ja: '続ける', ko: '계속', zh: '继续', ar: 'متابعة', ru: 'Продолжить' },
  'battle.elixir': { en: 'Elixir', es: 'Elixir', fr: 'Élixir', de: 'Elixier', pt: 'Elixir', ja: 'エリクサー', ko: '엘릭서', zh: '圣水', ar: 'الإكسير', ru: 'Эликсир' },
  'battle.time': { en: 'Time', es: 'Tiempo', fr: 'Temps', de: 'Zeit', pt: 'Tempo', ja: '時間', ko: '시간', zh: '时间', ar: 'الوقت', ru: 'Время' },
  'battle.overtime': { en: 'OVERTIME!', es: '¡TIEMPO EXTRA!', fr: 'PROLONGATION!', de: 'VERLÄNGERUNG!', pt: 'PRORROGAÇÃO!', ja: '延長戦！', ko: '연장전!', zh: '加时赛！', ar: 'وقت إضافي!', ru: 'ОВЕРТАЙМ!' },
  'battle.river_race': { en: 'River Race', es: 'Carrera del Río', fr: 'Course de Rivière', de: 'Flussrennen', pt: 'Corrida do Rio', ja: 'リバーレース', ko: '리버 레이스', zh: '河流竞赛', ar: 'سباق النهر', ru: 'Речная гонка' },
  'battle.medals': { en: 'Medals', es: 'Medallas', fr: 'Médailles', de: 'Medaillen', pt: 'Medalhas', ja: 'メダル', ko: '메달', zh: '奖牌', ar: 'الميداليات', ru: 'Медали' },
  'battle.gold_earned': { en: 'Gold Earned', es: 'Oro Ganado', fr: 'Or Gagné', de: 'Gold verdient', pt: 'Ouro Ganho', ja: 'ゴールド獲得', ko: '골드 획득', zh: '获得金币', ar: 'ذهب مكتسب', ru: 'Золото получено' },
  'battle.vs': { en: '⚔️ VS ⚔️', es: '⚔️ VS ⚔️', fr: '⚔️ VS ⚔️', de: '⚔️ VS ⚔️', pt: '⚔️ VS ⚔️', ja: '⚔️ VS ⚔️', ko: '⚔️ VS ⚔️', zh: '⚔️ VS ⚔️', ar: '⚔️ VS ⚔️', ru: '⚔️ VS ⚔️' },
  'battle.starting': { en: 'Battle starting...', es: 'Batalla comenzando...', fr: 'Combat en cours...', de: 'Kampf beginnt...', pt: 'Batalha começando...', ja: 'バトル開始...', ko: '전투 시작...', zh: '战斗开始...', ar: 'المعركة تبدأ...', ru: 'Бой начинается...' },
  'battle.double_elixir': { en: '⚡ DOUBLE ELIXIR!', es: '⚡ ¡ELIXIR DOBLE!', fr: '⚡ DOUBLE ÉLIXIR!', de: '⚡ DOPPELTES ELIXIER!', pt: '⚡ ELIXIR DUPLO!', ja: '⚡ ダブルエリクサー！', ko: '⚡ 더블 엘릭서!', zh: '⚡ 双倍圣水！', ar: '⚡ إكسير مزدوج!', ru: '⚡ ДВОЙНОЙ ЭЛИКСИР!' },
  'battle.boat_battle': { en: '⚓ BOAT BATTLE', es: '⚓ BATALLA NAVAL', fr: '⚓ COMBAT NAVAL', de: '⚓ BOOTKAMPF', pt: '⚓ BATALHA NAVAL', ja: '⚓ ボートバトル', ko: '⚓ 보트 전투', zh: '⚓ 船战', ar: '⚓ معركة بحرية', ru: '⚓ МОРСКОЙ БОЙ' },
  'battle.towers_destroyed': { en: 'Towers destroyed', es: 'Torres destruidas', fr: 'Tours détruites', de: 'Türme zerstört', pt: 'Torres destruídas', ja: 'タワー破壊', ko: '타워 파괴', zh: '塔被摧毁', ar: 'أبراج مدمرة', ru: 'Башни разрушены' },
  'battle.select_card': { en: 'Select a card first', es: 'Selecciona una carta', fr: 'Sélectionnez une carte', de: 'Wähle eine Karte', pt: 'Selecione uma carta', ja: 'カードを選択', ko: '카드를 선택하세요', zh: '先选择一张卡', ar: 'اختر بطاقة أولاً', ru: 'Выберите карту' },
  'battle.tap_tower': { en: '👆 Tap a tower to attack!', es: '👆 ¡Toca una torre!', fr: '👆 Touchez une tour!', de: '👆 Tippe auf einen Turm!', pt: '👆 Toque uma torre!', ja: '👆 タワーをタップ！', ko: '👆 타워를 탭하세요!', zh: '👆 点击塔来攻击！', ar: '👆 انقر على البرج!', ru: '👆 Нажмите на башню!' },
  'battle.defense_tower': { en: 'Defense Tower', es: 'Torre de Defensa', fr: 'Tour de Défense', de: 'Verteidigungsturm', pt: 'Torre de Defesa', ja: '防御タワー', ko: '방어 타워', zh: '防御塔', ar: 'برج الدفاع', ru: 'Башня обороны' },
  'battle.destroyed': { en: '💥 DESTROYED', es: '💥 DESTRUIDA', fr: '💥 DÉTRUITE', de: '💥 ZERSTÖRT', pt: '💥 DESTRUÍDA', ja: '💥 破壊', ko: '💥 파괴됨', zh: '💥 摧毁', ar: '💥 مدمر', ru: '💥 РАЗРУШЕНА' },
  'battle.next': { en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Nächste', pt: 'Próximo', ja: '次', ko: '다음', zh: '下一个', ar: 'التالي', ru: 'Следующая' },

  // ═══ Cards / Deck ═══
  'cards.my_deck': { en: 'My Deck', es: 'Mi Mazo', fr: 'Mon Deck', de: 'Mein Deck', pt: 'Meu Deck', ja: 'マイデッキ', ko: '내 덱', zh: '我的卡组', ar: 'مجموعتي', ru: 'Моя колода' },
  'cards.all_cards': { en: 'All Cards', es: 'Todas las Cartas', fr: 'Toutes les Cartes', de: 'Alle Karten', pt: 'Todas as Cartas', ja: '全カード', ko: '전체 카드', zh: '所有卡牌', ar: 'كل البطاقات', ru: 'Все карты' },
  'cards.emotes': { en: 'Emotes', es: 'Emoticones', fr: 'Emotes', de: 'Emotes', pt: 'Emotes', ja: 'エモート', ko: '이모트', zh: '表情', ar: 'التعبيرات', ru: 'Эмоции' },
  'cards.banners': { en: 'Banners', es: 'Estandartes', fr: 'Bannières', de: 'Banner', pt: 'Bandeiras', ja: 'バナー', ko: '배너', zh: '旗帜', ar: 'اللافتات', ru: 'Баннеры' },
  'cards.add_to_deck': { en: 'Add to Deck', es: 'Añadir al Mazo', fr: 'Ajouter au Deck', de: 'Zum Deck hinzufügen', pt: 'Adicionar ao Deck', ja: 'デッキに追加', ko: '덱에 추가', zh: '加入卡组', ar: 'أضف للمجموعة', ru: 'Добавить в колоду' },
  'cards.remove': { en: 'Remove', es: 'Quitar', fr: 'Retirer', de: 'Entfernen', pt: 'Remover', ja: '削除', ko: '제거', zh: '移除', ar: 'إزالة', ru: 'Убрать' },
  'cards.locked': { en: 'Locked', es: 'Bloqueada', fr: 'Verrouillée', de: 'Gesperrt', pt: 'Bloqueada', ja: 'ロック中', ko: '잠김', zh: '已锁定', ar: 'مقفلة', ru: 'Заблокировано' },
  'cards.unlock_arena': { en: 'Unlock at Arena', es: 'Desbloquear en Arena', fr: 'Débloquer à l\'Arène', de: 'Freischalten in Arena', pt: 'Desbloquear na Arena', ja: 'アリーナで解放', ko: '아레나에서 해제', zh: '在竞技场解锁', ar: 'فتح في الحلبة', ru: 'Откроется в Арене' },
  'cards.equip': { en: 'Equip', es: 'Equipar', fr: 'Équiper', de: 'Ausrüsten', pt: 'Equipar', ja: '装備', ko: '장착', zh: '装备', ar: 'تجهيز', ru: 'Экипировать' },
  'cards.equipped': { en: 'Equipped', es: 'Equipado', fr: 'Équipé', de: 'Ausgerüstet', pt: 'Equipado', ja: '装備中', ko: '장착됨', zh: '已装备', ar: 'مجهز', ru: 'Экипировано' },
  'cards.deck_full': { en: 'Deck is full!', es: '¡Mazo completo!', fr: 'Deck complet!', de: 'Deck voll!', pt: 'Deck cheio!', ja: 'デッキが満杯！', ko: '덱이 가득 찼습니다!', zh: '卡组已满！', ar: 'المجموعة ممتلئة!', ru: 'Колода полна!' },
  'cards.already_in_deck': { en: 'Already in deck!', es: '¡Ya está en el mazo!', fr: 'Déjà dans le deck!', de: 'Bereits im Deck!', pt: 'Já está no deck!', ja: 'すでにデッキに入っています！', ko: '이미 덱에 있습니다!', zh: '已在卡组中！', ar: 'موجودة بالفعل!', ru: 'Уже в колоде!' },
  'cards.battle_deck': { en: 'BATTLE DECK', es: 'MAZO DE BATALLA', fr: 'DECK DE COMBAT', de: 'KAMPFDECK', pt: 'DECK DE BATALHA', ja: 'バトルデッキ', ko: '배틀 덱', zh: '战斗卡组', ar: 'مجموعة المعركة', ru: 'БОЕВАЯ КОЛОДА' },
  'cards.battle_banner': { en: 'BATTLE BANNER', es: 'ESTANDARTE', fr: 'BANNIÈRE', de: 'KAMPFBANNER', pt: 'BANDEIRA', ja: 'バトルバナー', ko: '배틀 배너', zh: '战斗旗帜', ar: 'لافتة المعركة', ru: 'БОЕВОЙ БАННЕР' },
  'cards.deck': { en: 'Deck', es: 'Mazo', fr: 'Deck', de: 'Deck', pt: 'Deck', ja: 'デッキ', ko: '덱', zh: '卡组', ar: 'مجموعة', ru: 'Колода' },
  'cards.avg_elixir': { en: 'Avg Elixir', es: 'Elixir Prom.', fr: 'Élixir Moy.', de: 'Ø Elixier', pt: 'Elixir Méd.', ja: '平均エリクサー', ko: '평균 엘릭서', zh: '平均圣水', ar: 'متوسط الإكسير', ru: 'Сред. эликсир' },
  'cards.hero_slots': { en: 'Hero Slots', es: 'Ranuras Héroe', fr: 'Empl. Héros', de: 'Heldenslots', pt: 'Slots Herói', ja: 'ヒーロースロット', ko: '히어로 슬롯', zh: '英雄槽位', ar: 'فتحات الأبطال', ru: 'Слоты героев' },
  'cards.not_unlocked': { en: '🔒 Not Unlocked', es: '🔒 No Desbloqueado', fr: '🔒 Non Débloqué', de: '🔒 Nicht Freigeschaltet', pt: '🔒 Não Desbloqueado', ja: '🔒 未解放', ko: '🔒 미해제', zh: '🔒 未解锁', ar: '🔒 غير مفتوح', ru: '🔒 Не открыто' },
  'cards.upgrade': { en: 'Upgrade', es: 'Mejorar', fr: 'Améliorer', de: 'Aufwerten', pt: 'Melhorar', ja: 'アップグレード', ko: '업그레이드', zh: '升级', ar: 'ترقية', ru: 'Улучшить' },
  'cards.all': { en: 'All', es: 'Todos', fr: 'Tous', de: 'Alle', pt: 'Todos', ja: '全て', ko: '전체', zh: '全部', ar: 'الكل', ru: 'Все' },
  'cards.troop': { en: 'Troop', es: 'Tropa', fr: 'Troupe', de: 'Truppe', pt: 'Tropa', ja: 'ユニット', ko: '유닛', zh: '部队', ar: 'جندي', ru: 'Отряд' },
  'cards.spell': { en: 'Spell', es: 'Hechizo', fr: 'Sort', de: 'Zauber', pt: 'Feitiço', ja: '呪文', ko: '주문', zh: '法术', ar: 'تعويذة', ru: 'Заклинание' },
  'cards.building': { en: 'Building', es: 'Edificio', fr: 'Bâtiment', de: 'Gebäude', pt: 'Construção', ja: '建物', ko: '건물', zh: '建筑', ar: 'مبنى', ru: 'Здание' },
  'cards.no_bg': { en: 'No backgrounds owned yet.', es: 'Sin fondos aún.', fr: 'Aucun fond possédé.', de: 'Noch keine Hintergründe.', pt: 'Sem fundos ainda.', ja: 'まだ背景がありません。', ko: '배경이 아직 없습니다.', zh: '还没有背景。', ar: 'لا خلفيات بعد.', ru: 'Нет фонов.' },
  'cards.no_emb': { en: 'No emblems owned yet.', es: 'Sin emblemas aún.', fr: 'Aucun emblème possédé.', de: 'Noch keine Embleme.', pt: 'Sem emblemas ainda.', ja: 'まだエンブレムがありません。', ko: '엠블럼이 아직 없습니다.', zh: '还没有徽章。', ar: 'لا شعارات بعد.', ru: 'Нет эмблем.' },
  'cards.no_badges': { en: 'No badges earned yet.', es: 'Sin insignias aún.', fr: 'Aucun badge obtenu.', de: 'Noch keine Abzeichen.', pt: 'Sem insígnias ainda.', ja: 'まだバッジがありません。', ko: '배지가 아직 없습니다.', zh: '还没有徽章。', ar: 'لا شارات بعد.', ru: 'Нет значков.' },

  // ═══ Social / Leaderboard ═══
  'social.clan': { en: 'Clan', es: 'Clan', fr: 'Clan', de: 'Clan', pt: 'Clã', ja: 'クラン', ko: '클랜', zh: '部落', ar: 'العشيرة', ru: 'Клан' },
  'social.friends': { en: 'Friends', es: 'Amigos', fr: 'Amis', de: 'Freunde', pt: 'Amigos', ja: 'フレンド', ko: '친구', zh: '好友', ar: 'الأصدقاء', ru: 'Друзья' },
  'social.leaderboard': { en: '🏆 Leaderboard', es: '🏆 Clasificación', fr: '🏆 Classement', de: '🏆 Rangliste', pt: '🏆 Ranking', ja: '🏆 ランキング', ko: '🏆 리더보드', zh: '🏆 排行榜', ar: '🏆 لوحة الصدارة', ru: '🏆 Таблица лидеров' },
  'social.local': { en: '🏠 Local', es: '🏠 Local', fr: '🏠 Local', de: '🏠 Lokal', pt: '🏠 Local', ja: '🏠 ローカル', ko: '🏠 로컬', zh: '🏠 本地', ar: '🏠 محلي', ru: '🏠 Местные' },
  'social.worldwide': { en: '🌍 Worldwide', es: '🌍 Mundial', fr: '🌍 Mondial', de: '🌍 Weltweit', pt: '🌍 Mundial', ja: '🌍 世界', ko: '🌍 세계', zh: '🌍 全球', ar: '🌍 عالمي', ru: '🌍 Мировые' },
  'social.top100': { en: '👑 Top #100', es: '👑 Top #100', fr: '👑 Top #100', de: '👑 Top #100', pt: '👑 Top #100', ja: '👑 Top #100', ko: '👑 Top #100', zh: '👑 Top #100', ar: '👑 Top #100', ru: '👑 Топ #100' },
  'social.no_clan': { en: 'No Clan', es: 'Sin Clan', fr: 'Pas de Clan', de: 'Kein Clan', pt: 'Sem Clã', ja: 'クランなし', ko: '클랜 없음', zh: '无部落', ar: 'بدون عشيرة', ru: 'Без клана' },
  'social.create_clan': { en: 'Create a Clan', es: 'Crear un Clan', fr: 'Créer un Clan', de: 'Clan erstellen', pt: 'Criar um Clã', ja: 'クラン作成', ko: '클랜 생성', zh: '创建部落', ar: 'إنشاء عشيرة', ru: 'Создать клан' },
  'social.search_clans': { en: 'Search Clans', es: 'Buscar Clanes', fr: 'Chercher des Clans', de: 'Clans suchen', pt: 'Buscar Clãs', ja: 'クラン検索', ko: '클랜 검색', zh: '搜索部落', ar: 'البحث عن عشائر', ru: 'Поиск кланов' },
  'social.join': { en: 'Join', es: 'Unirse', fr: 'Rejoindre', de: 'Beitreten', pt: 'Entrar', ja: '参加', ko: '가입', zh: '加入', ar: 'انضمام', ru: 'Вступить' },
  'social.leave': { en: 'Leave', es: 'Salir', fr: 'Quitter', de: 'Verlassen', pt: 'Sair', ja: '退出', ko: '탈퇴', zh: '离开', ar: 'مغادرة', ru: 'Покинуть' },
  'social.chat': { en: 'Chat', es: 'Chat', fr: 'Discussion', de: 'Chat', pt: 'Chat', ja: 'チャット', ko: '채팅', zh: '聊天', ar: 'محادثة', ru: 'Чат' },
  'social.trade': { en: 'Trade', es: 'Intercambiar', fr: 'Échange', de: 'Tauschen', pt: 'Trocar', ja: 'トレード', ko: '교환', zh: '交易', ar: 'تبادل', ru: 'Обмен' },
  'social.request': { en: 'Request', es: 'Solicitar', fr: 'Demander', de: 'Anfragen', pt: 'Solicitar', ja: 'リクエスト', ko: '요청', zh: '请求', ar: 'طلب', ru: 'Запрос' },
  'social.donate': { en: 'Donate', es: 'Donar', fr: 'Donner', de: 'Spenden', pt: 'Doar', ja: '寄付', ko: '기부', zh: '捐赠', ar: 'تبرع', ru: 'Пожертвовать' },
  'social.add_friend': { en: 'Add', es: 'Añadir', fr: 'Ajouter', de: 'Hinzufügen', pt: 'Adicionar', ja: '追加', ko: '추가', zh: '添加', ar: 'إضافة', ru: 'Добавить' },
  'social.no_friends': { en: 'No friends yet. Add someone by their tag!', es: '¡Sin amigos aún. Añade a alguien por su tag!', fr: 'Pas encore d\'amis. Ajoutez quelqu\'un par son tag!', de: 'Noch keine Freunde. Füge jemanden per Tag hinzu!', pt: 'Sem amigos ainda. Adicione alguém pela tag!', ja: 'まだフレンドがいません。タグで追加しよう！', ko: '아직 친구가 없습니다. 태그로 추가하세요!', zh: '还没有好友，通过标签添加吧！', ar: 'لا أصدقاء بعد. أضف شخصًا بعلامته!', ru: 'Пока нет друзей. Добавьте по тегу!' },
  'social.no_players': { en: 'No players yet', es: 'Sin jugadores aún', fr: 'Pas encore de joueurs', de: 'Noch keine Spieler', pt: 'Sem jogadores ainda', ja: 'まだプレイヤーがいません', ko: '아직 플레이어가 없습니다', zh: '还没有玩家', ar: 'لا لاعبين بعد', ru: 'Пока нет игроков' },
  'social.your_location': { en: 'Your location', es: 'Tu ubicación', fr: 'Votre emplacement', de: 'Dein Standort', pt: 'Sua localização', ja: 'あなたの場所', ko: '당신의 위치', zh: '你的位置', ar: 'موقعك', ru: 'Ваше расположение' },
  'social.your_rank': { en: 'Your rank', es: 'Tu posición', fr: 'Votre rang', de: 'Dein Rang', pt: 'Sua posição', ja: 'あなたの順位', ko: '당신의 순위', zh: '你的排名', ar: 'مرتبتك', ru: 'Ваш ранг' },
  'social.detecting': { en: 'Detecting...', es: 'Detectando...', fr: 'Détection...', de: 'Erkennung...', pt: 'Detectando...', ja: '検出中...', ko: '감지 중...', zh: '检测中...', ar: 'جاري الكشف...', ru: 'Определение...' },
  'social.top100_rewards': { en: 'Top 100 Rewards — Exclusive Banners & Emotes', es: 'Recompensas Top 100 — Estandartes y Emoticones Exclusivos', fr: 'Récompenses Top 100 — Bannières & Emotes Exclusives', de: 'Top 100 Belohnungen — Exklusive Banner & Emotes', pt: 'Recompensas Top 100 — Bandeiras e Emotes Exclusivos', ja: 'Top100報酬 — 限定バナー＆エモート', ko: 'Top 100 보상 — 독점 배너 & 이모트', zh: 'Top100奖励 — 独家旗帜和表情', ar: 'مكافآت Top 100 — لافتات وتعبيرات حصرية', ru: 'Награды Топ-100 — Эксклюзивные баннеры и эмоции' },
  'social.top10_rewards': { en: 'Top 10 National Rewards', es: 'Recompensas Nacionales Top 10', fr: 'Récompenses Nationales Top 10', de: 'Nationale Top 10 Belohnungen', pt: 'Recompensas Nacionais Top 10', ja: '国内Top10報酬', ko: '국내 Top 10 보상', zh: '国内Top10奖励', ar: 'مكافآت Top 10 الوطنية', ru: 'Награды топ-10 страны' },
  'social.join_create': { en: 'Join or create a clan to battle together!', es: '¡Únete o crea un clan para luchar juntos!', fr: 'Rejoignez ou créez un clan pour combattre ensemble!', de: 'Tritt einem Clan bei oder erstelle einen, um gemeinsam zu kämpfen!', pt: 'Entre ou crie um clã para batalhar juntos!', ja: 'クランに参加または作成して一緒に戦おう！', ko: '클랜에 가입하거나 만들어서 함께 싸우세요!', zh: '加入或创建部落一起战斗！', ar: 'انضم أو أنشئ عشيرة للقتال معًا!', ru: 'Вступите или создайте клан для совместных боёв!' },
  'social.add_by_tag': { en: 'Add by Player Tag', es: 'Añadir por Tag del Jugador', fr: 'Ajouter par Tag Joueur', de: 'Per Spieler-Tag hinzufügen', pt: 'Adicionar por Tag do Jogador', ja: 'プレイヤータグで追加', ko: '플레이어 태그로 추가', zh: '通过玩家标签添加', ar: 'إضافة بعلامة اللاعب', ru: 'Добавить по тегу' },
  'social.leader': { en: 'Leader', es: 'Líder', fr: 'Chef', de: 'Anführer', pt: 'Líder', ja: 'リーダー', ko: '리더', zh: '首领', ar: 'القائد', ru: 'Лидер' },
  'social.members': { en: 'members', es: 'miembros', fr: 'membres', de: 'Mitglieder', pt: 'membros', ja: 'メンバー', ko: '멤버', zh: '成员', ar: 'أعضاء', ru: 'участников' },
  'social.title': { en: 'Social', es: 'Social', fr: 'Social', de: 'Sozial', pt: 'Social', ja: 'ソーシャル', ko: '소셜', zh: '社交', ar: 'اجتماعي', ru: 'Соцсеть' },
  'social.customize_flag': { en: 'Customize Flag', es: 'Personalizar Bandera', fr: 'Personnaliser Drapeau', de: 'Flagge anpassen', pt: 'Personalizar Bandeira', ja: '旗をカスタマイズ', ko: '깃발 커스터마이즈', zh: '自定义旗帜', ar: 'تخصيص العلم', ru: 'Настроить флаг' },

  // ═══ Shop ═══
  'shop.title': { en: 'Shop', es: 'Tienda', fr: 'Boutique', de: 'Shop', pt: 'Loja', ja: 'ショップ', ko: '상점', zh: '商店', ar: 'المتجر', ru: 'Магазин' },
  'shop.featured': { en: 'Featured', es: 'Destacados', fr: 'En Vedette', de: 'Empfohlen', pt: 'Destaque', ja: 'おすすめ', ko: '추천', zh: '精选', ar: 'المميزة', ru: 'Рекомендуемое' },
  'shop.chests': { en: 'Chests', es: 'Cofres', fr: 'Coffres', de: 'Truhen', pt: 'Baús', ja: 'チェスト', ko: '상자', zh: '宝箱', ar: 'الصناديق', ru: 'Сундуки' },
  'shop.gems': { en: 'Gems', es: 'Gemas', fr: 'Gemmes', de: 'Juwelen', pt: 'Gemas', ja: 'ジェム', ko: '보석', zh: '宝石', ar: 'الأحجار', ru: 'Самоцветы' },
  'shop.gold': { en: 'Gold', es: 'Oro', fr: 'Or', de: 'Gold', pt: 'Ouro', ja: 'ゴールド', ko: '골드', zh: '金币', ar: 'ذهب', ru: 'Золото' },
  'shop.buy': { en: 'Buy', es: 'Comprar', fr: 'Acheter', de: 'Kaufen', pt: 'Comprar', ja: '購入', ko: '구매', zh: '购买', ar: 'شراء', ru: 'Купить' },
  'shop.confirm_purchase': { en: 'Confirm Purchase', es: 'Confirmar Compra', fr: 'Confirmer l\'Achat', de: 'Kauf bestätigen', pt: 'Confirmar Compra', ja: '購入確認', ko: '구매 확인', zh: '确认购买', ar: 'تأكيد الشراء', ru: 'Подтвердить покупку' },
  'shop.cancel': { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', pt: 'Cancelar', ja: 'キャンセル', ko: '취소', zh: '取消', ar: 'إلغاء', ru: 'Отмена' },
  'shop.daily_deals': { en: 'Daily Deals', es: 'Ofertas Diarias', fr: 'Offres du Jour', de: 'Tagesangebote', pt: 'Ofertas Diárias', ja: '日替わりセール', ko: '일일 거래', zh: '每日特惠', ar: 'عروض يومية', ru: 'Ежедневные сделки' },
  'shop.free': { en: 'FREE', es: 'GRATIS', fr: 'GRATUIT', de: 'GRATIS', pt: 'GRÁTIS', ja: '無料', ko: '무료', zh: '免费', ar: 'مجاني', ru: 'БЕСПЛАТНО' },
  'shop.you_got': { en: 'YOU GOT!', es: '¡OBTUVISTE!', fr: 'OBTENU!', de: 'ERHALTEN!', pt: 'VOCÊ GANHOU!', ja: '獲得！', ko: '획득!', zh: '你获得了！', ar: 'حصلت على!', ru: 'ВЫ ПОЛУЧИЛИ!' },
  'shop.collect': { en: 'Collect', es: 'Recolectar', fr: 'Collecter', de: 'Einsammeln', pt: 'Coletar', ja: '受け取る', ko: '수집', zh: '收取', ar: 'جمع', ru: 'Собрать' },
  'shop.not_enough': { en: 'Not enough', es: 'No hay suficiente', fr: 'Pas assez de', de: 'Nicht genug', pt: 'Não há suficiente', ja: '足りません', ko: '부족합니다', zh: '不足', ar: 'لا يكفي', ru: 'Недостаточно' },
  'shop.daily_free_cards': { en: '🎁 Daily Free Cards', es: '🎁 Cartas Gratis Diarias', fr: '🎁 Cartes Gratuites du Jour', de: '🎁 Tägliche Gratiskarten', pt: '🎁 Cartas Grátis Diárias', ja: '🎁 デイリー無料カード', ko: '🎁 일일 무료 카드', zh: '🎁 每日免费卡牌', ar: '🎁 بطاقات مجانية يومية', ru: '🎁 Бесплатные карты дня' },
  'shop.refreshes_in': { en: 'Refreshes in', es: 'Se renueva en', fr: 'Rafraîchit dans', de: 'Aktualisiert in', pt: 'Renova em', ja: '更新まで', ko: '갱신까지', zh: '刷新于', ar: 'يتجدد في', ru: 'Обновление через' },
  'shop.sold': { en: 'SOLD', es: 'VENDIDO', fr: 'VENDU', de: 'VERKAUFT', pt: 'VENDIDO', ja: '売切', ko: '판매됨', zh: '已售', ar: 'مباع', ru: 'ПРОДАНО' },
  'shop.claimed': { en: 'CLAIMED', es: 'RECLAMADO', fr: 'RÉCUPÉRÉ', de: 'ABGEHOLT', pt: 'RESGATADO', ja: '受取済', ko: '수령됨', zh: '已领取', ar: 'تمت المطالبة', ru: 'ПОЛУЧЕНО' },
  'shop.owned': { en: 'OWNED', es: 'POSEÍDO', fr: 'POSSÉDÉ', de: 'BESITZT', pt: 'ADQUIRIDO', ja: '所持', ko: '보유중', zh: '已拥有', ar: 'مملوك', ru: 'В НАЛИЧИИ' },
  'shop.daily_emote_deals': { en: '😀 Daily Emote Deals', es: '😀 Ofertas de Emotes', fr: '😀 Offres Emotes', de: '😀 Tägliche Emote-Angebote', pt: '😀 Ofertas de Emotes', ja: '😀 日替わりエモート', ko: '😀 일일 이모트', zh: '😀 每日表情特惠', ar: '😀 عروض التعبيرات', ru: '😀 Эмоции дня' },
  'shop.daily_banner_deals': { en: 'Daily Banner Deals', es: 'Ofertas de Estandartes', fr: 'Offres Bannières', de: 'Tägliche Banner-Deals', pt: 'Ofertas de Bandeiras', ja: 'デイリーバナー', ko: '일일 배너', zh: '每日旗帜特惠', ar: 'عروض اللافتات', ru: 'Баннеры дня' },
  'shop.todays_bg': { en: "🖼️ Today's Backgrounds", es: '🖼️ Fondos de Hoy', fr: "🖼️ Fonds du Jour", de: '🖼️ Heutige Hintergründe', pt: '🖼️ Fundos de Hoje', ja: '🖼️ 本日の背景', ko: '🖼️ 오늘의 배경', zh: '🖼️ 今日背景', ar: '🖼️ خلفيات اليوم', ru: '🖼️ Фоны дня' },
  'shop.todays_emb': { en: "🎭 Today's Emblems", es: '🎭 Emblemas de Hoy', fr: "🎭 Emblèmes du Jour", de: '🎭 Heutige Embleme', pt: '🎭 Emblemas de Hoje', ja: '🎭 本日のエンブレム', ko: '🎭 오늘의 엠블럼', zh: '🎭 今日徽章', ar: '🎭 شعارات اليوم', ru: '🎭 Эмблемы дня' },

  // ═══ Events ═══
  'events.title': { en: 'Events', es: 'Eventos', fr: 'Événements', de: 'Events', pt: 'Eventos', ja: 'イベント', ko: '이벤트', zh: '活动', ar: 'الأحداث', ru: 'События' },
  'events.events': { en: 'Events', es: 'Eventos', fr: 'Événements', de: 'Events', pt: 'Eventos', ja: 'イベント', ko: '이벤트', zh: '活动', ar: 'الأحداث', ru: 'События' },
  'events.challenges': { en: 'Challenges', es: 'Desafíos', fr: 'Défis', de: 'Herausforderungen', pt: 'Desafios', ja: 'チャレンジ', ko: '도전', zh: '挑战', ar: 'التحديات', ru: 'Вызовы' },
  'events.tournaments': { en: 'Tournaments', es: 'Torneos', fr: 'Tournois', de: 'Turniere', pt: 'Torneios', ja: 'トーナメント', ko: '토너먼트', zh: '锦标赛', ar: 'البطولات', ru: 'Турниры' },
  'events.daily_quests': { en: '📋 Daily Quests', es: '📋 Misiones Diarias', fr: '📋 Quêtes du Jour', de: '📋 Tägliche Aufgaben', pt: '📋 Missões Diárias', ja: '📋 デイリークエスト', ko: '📋 일일 퀘스트', zh: '📋 每日任务', ar: '📋 المهام اليومية', ru: '📋 Ежедневные задания' },
  'events.time_left': { en: 'TIME LEFT', es: 'TIEMPO RESTANTE', fr: 'TEMPS RESTANT', de: 'VERBLEIBENDE ZEIT', pt: 'TEMPO RESTANTE', ja: '残り時間', ko: '남은 시간', zh: '剩余时间', ar: 'الوقت المتبقي', ru: 'ОСТАЛОСЬ' },
  'events.wins': { en: 'WINS', es: 'VICTORIAS', fr: 'VICTOIRES', de: 'SIEGE', pt: 'VITÓRIAS', ja: '勝利', ko: '승리', zh: '胜利', ar: 'الانتصارات', ru: 'ПОБЕД' },
  'events.losses': { en: 'LOSSES', es: 'DERROTAS', fr: 'DÉFAITES', de: 'NIEDERLAGEN', pt: 'DERROTAS', ja: '敗北', ko: '패배', zh: '失败', ar: 'الهزائم', ru: 'ПОРАЖЕНИЙ' },
  'events.milestones': { en: 'Milestones', es: 'Hitos', fr: 'Jalons', de: 'Meilensteine', pt: 'Marcos', ja: 'マイルストーン', ko: '마일스톤', zh: '里程碑', ar: 'الإنجازات', ru: 'Этапы' },
  'events.battle': { en: '⚔️ Battle!', es: '⚔️ ¡Batalla!', fr: '⚔️ Combat!', de: '⚔️ Kampf!', pt: '⚔️ Batalha!', ja: '⚔️ バトル！', ko: '⚔️ 전투!', zh: '⚔️ 战斗！', ar: '⚔️ معركة!', ru: '⚔️ В бой!' },
  'events.completed': { en: 'COMPLETED', es: 'COMPLETADO', fr: 'TERMINÉ', de: 'ABGESCHLOSSEN', pt: 'CONCLUÍDO', ja: '完了', ko: '완료', zh: '已完成', ar: 'مكتمل', ru: 'ЗАВЕРШЕНО' },
  'events.claim_available': { en: 'Claim Available Event Rewards', es: 'Reclamar Recompensas Disponibles', fr: 'Récupérer les Récompenses', de: 'Verfügbare Belohnungen abholen', pt: 'Resgatar Recompensas', ja: '利用可能な報酬を受取', ko: '받을 수 있는 보상 수령', zh: '领取可用奖励', ar: 'اطلب المكافآت المتاحة', ru: 'Забрать доступные награды' },
  'events.resets': { en: 'Resets', es: 'Se reinicia', fr: 'Réinitialisation', de: 'Reset', pt: 'Reinicia', ja: 'リセット', ko: '리셋', zh: '重置', ar: 'إعادة تعيين', ru: 'Сброс' },

  // ═══ Profile ═══
  'profile.title': { en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', pt: 'Perfil', ja: 'プロフィール', ko: '프로필', zh: '个人资料', ar: 'الملف الشخصي', ru: 'Профиль' },
  'profile.wins': { en: 'Wins', es: 'Victorias', fr: 'Victoires', de: 'Siege', pt: 'Vitórias', ja: '勝利', ko: '승리', zh: '胜场', ar: 'انتصارات', ru: 'Победы' },
  'profile.losses': { en: 'Losses', es: 'Derrotas', fr: 'Défaites', de: 'Niederlagen', pt: 'Derrotas', ja: '敗北', ko: '패배', zh: '败场', ar: 'هزائم', ru: 'Поражения' },
  'profile.3_crown_wins': { en: '3 Crown Wins', es: 'Victorias 3 Coronas', fr: 'Victoires 3 Couronnes', de: '3 Kronen Siege', pt: 'Vitórias 3 Coroas', ja: '3冠勝利', ko: '3크라운 승리', zh: '三冠胜场', ar: 'انتصارات 3 تيجان', ru: '3 короны' },
  'profile.max_trophies': { en: 'Max Trophies', es: 'Máx. Trofeos', fr: 'Trophées Max', de: 'Max. Trophäen', pt: 'Troféus Máx.', ja: '最高トロフィー', ko: '최대 트로피', zh: '最高奖杯', ar: 'أقصى كؤوس', ru: 'Макс. трофеи' },
  'profile.challenge_max': { en: 'Challenge Max', es: 'Máx. Desafío', fr: 'Défi Max', de: 'Herausforderungsmax.', pt: 'Máx. Desafio', ja: 'チャレンジ最大', ko: '챌린지 최대', zh: '挑战最高', ar: 'أقصى تحدي', ru: 'Макс. вызов' },
  'profile.war_day_wins': { en: 'War Day Wins', es: 'Victorias Día de Guerra', fr: 'Victoires Jour de Guerre', de: 'Kriegstag-Siege', pt: 'Vitórias Dia de Guerra', ja: '戦争勝利', ko: '전쟁의 날 승리', zh: '战争日胜场', ar: 'انتصارات يوم الحرب', ru: 'Победы в дне войны' },
  'profile.cards_collected': { en: 'Cards Collected', es: 'Cartas Recolectadas', fr: 'Cartes Collectées', de: 'Gesammelte Karten', pt: 'Cartas Coletadas', ja: '収集したカード', ko: '수집한 카드', zh: '收集的卡牌', ar: 'بطاقات مجمعة', ru: 'Собрано карт' },
  'profile.total_donations': { en: 'Total Donations', es: 'Donaciones Totales', fr: 'Dons Totaux', de: 'Gesamtspenden', pt: 'Doações Totais', ja: '総寄付', ko: '총 기부', zh: '总捐赠', ar: 'إجمالي التبرعات', ru: 'Всего пожертвований' },
  'profile.badges': { en: 'Badges', es: 'Insignias', fr: 'Badges', de: 'Abzeichen', pt: 'Emblemas', ja: 'バッジ', ko: '배지', zh: '徽章', ar: 'الشارات', ru: 'Значки' },
  'profile.sign_out': { en: 'Sign Out', es: 'Cerrar Sesión', fr: 'Déconnexion', de: 'Abmelden', pt: 'Sair', ja: 'ログアウト', ko: '로그아웃', zh: '退出登录', ar: 'تسجيل الخروج', ru: 'Выйти' },
  'profile.copy_tag': { en: 'Copy', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar', ja: 'コピー', ko: '복사', zh: '复制', ar: 'نسخ', ru: 'Копировать' },

  // ═══ Settings ═══
  'settings.title': { en: '⚙️ Settings', es: '⚙️ Ajustes', fr: '⚙️ Paramètres', de: '⚙️ Einstellungen', pt: '⚙️ Configurações', ja: '⚙️ 設定', ko: '⚙️ 설정', zh: '⚙️ 设置', ar: '⚙️ الإعدادات', ru: '⚙️ Настройки' },
  'settings.audio': { en: 'Audio Settings', es: 'Ajustes de Audio', fr: 'Paramètres Audio', de: 'Audioeinstellungen', pt: 'Configurações de Áudio', ja: 'オーディオ設定', ko: '오디오 설정', zh: '音频设置', ar: 'إعدادات الصوت', ru: 'Настройки звука' },
  'settings.sfx': { en: 'Sound Effects', es: 'Efectos de Sonido', fr: 'Effets Sonores', de: 'Soundeffekte', pt: 'Efeitos Sonoros', ja: '効果音', ko: '효과음', zh: '音效', ar: 'المؤثرات الصوتية', ru: 'Звуковые эффекты' },
  'settings.music': { en: 'Music', es: 'Música', fr: 'Musique', de: 'Musik', pt: 'Música', ja: '音楽', ko: '음악', zh: '音乐', ar: 'الموسيقى', ru: 'Музыка' },
  'settings.sfx_volume': { en: 'SFX Volume', es: 'Volumen SFX', fr: 'Volume SFX', de: 'SFX-Lautstärke', pt: 'Volume SFX', ja: 'SFX音量', ko: 'SFX 볼륨', zh: 'SFX音量', ar: 'حجم المؤثرات', ru: 'Громкость SFX' },
  'settings.music_volume': { en: 'Music Volume', es: 'Volumen de Música', fr: 'Volume Musique', de: 'Musiklautstärke', pt: 'Volume da Música', ja: '音楽の音量', ko: '음악 볼륨', zh: '音乐音量', ar: 'حجم الموسيقى', ru: 'Громкость музыки' },
  'settings.mute_all': { en: 'Mute All', es: 'Silenciar Todo', fr: 'Tout Couper', de: 'Alles stumm', pt: 'Silenciar Tudo', ja: '全ミュート', ko: '모두 음소거', zh: '全部静音', ar: 'كتم الكل', ru: 'Выключить всё' },
  'settings.unmute_all': { en: 'Unmute All', es: 'Activar Todo', fr: 'Tout Activer', de: 'Alles laut', pt: 'Ativar Tudo', ja: '全ミュート解除', ko: '모두 음소거 해제', zh: '取消全部静音', ar: 'إلغاء كتم الكل', ru: 'Включить всё' },
  'settings.visuals': { en: 'Visual Effects', es: 'Efectos Visuales', fr: 'Effets Visuels', de: 'Visuelle Effekte', pt: 'Efeitos Visuais', ja: 'ビジュアルエフェクト', ko: '시각 효과', zh: '视觉效果', ar: 'المؤثرات البصرية', ru: 'Визуальные эффекты' },
  'settings.card_animations': { en: 'Card Animations', es: 'Animaciones de Cartas', fr: 'Animations des Cartes', de: 'Kartenanimationen', pt: 'Animações de Cartas', ja: 'カードアニメーション', ko: '카드 애니메이션', zh: '卡牌动画', ar: 'رسوم البطاقات', ru: 'Анимации карт' },
  'settings.particles': { en: 'Particle Effects', es: 'Efectos de Partículas', fr: 'Effets de Particules', de: 'Partikeleffekte', pt: 'Efeitos de Partículas', ja: 'パーティクルエフェクト', ko: '파티클 효과', zh: '粒子效果', ar: 'تأثيرات الجزيئات', ru: 'Эффекты частиц' },
  'settings.language': { en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache', pt: 'Idioma', ja: '言語', ko: '언어', zh: '语言', ar: 'اللغة', ru: 'Язык' },
  'settings.language_desc': { en: 'Choose your preferred language', es: 'Elige tu idioma preferido', fr: 'Choisissez votre langue préférée', de: 'Wähle deine bevorzugte Sprache', pt: 'Escolha seu idioma preferido', ja: 'お好みの言語を選択', ko: '원하는 언어를 선택하세요', zh: '选择您偏好的语言', ar: 'اختر لغتك المفضلة', ru: 'Выберите предпочитаемый язык' },

  // ═══ Trophy Road ═══
  'trophy.title': { en: 'Trophy Road', es: 'Camino de Trofeos', fr: 'Route des Trophées', de: 'Trophäenstraße', pt: 'Estrada dos Troféus', ja: 'トロフィーロード', ko: '트로피 로드', zh: '奖杯之路', ar: 'طريق الكؤوس', ru: 'Дорога трофеев' },
  'trophy.claim': { en: 'Claim', es: 'Reclamar', fr: 'Récupérer', de: 'Abholen', pt: 'Resgatar', ja: '受取', ko: '수령', zh: '领取', ar: 'مطالبة', ru: 'Забрать' },
  'trophy.claimed': { en: 'Claimed', es: 'Reclamado', fr: 'Récupéré', de: 'Abgeholt', pt: 'Resgatado', ja: '受取済み', ko: '수령됨', zh: '已领取', ar: 'تمت المطالبة', ru: 'Забрано' },
  'trophy.matchmaking': { en: 'Matchmaking Range', es: 'Rango de Emparejamiento', fr: 'Fourchette de Matchmaking', de: 'Matchmaking-Bereich', pt: 'Faixa de Matchmaking', ja: 'マッチメイキング範囲', ko: '매치메이킹 범위', zh: '匹配范围', ar: 'نطاق التوفيق', ru: 'Диапазон подбора' },
  'trophy.no_derank': { en: 'Cannot derank from this arena!', es: '¡No puedes bajar de esta arena!', fr: 'Impossible de rétrograder de cette arène!', de: 'Kann nicht aus dieser Arena absteigen!', pt: 'Não pode descer desta arena!', ja: 'このアリーナから降格しません！', ko: '이 아레나에서 강등되지 않습니다!', zh: '不会从这个竞技场降级！', ar: 'لا يمكن التراجع من هذه الحلبة!', ru: 'Нельзя понизиться из этой арены!' },
  'trophy.cards_unlocked': { en: 'Cards Unlocked', es: 'Cartas Desbloqueadas', fr: 'Cartes Débloquées', de: 'Freigeschaltete Karten', pt: 'Cartas Desbloqueadas', ja: '解放カード', ko: '해제된 카드', zh: '已解锁卡牌', ar: 'بطاقات مفتوحة', ru: 'Открытые карты' },
  'trophy.progress': { en: 'Progress to next Arena', es: 'Progreso a la siguiente Arena', fr: 'Progression vers la prochaine Arène', de: 'Fortschritt zur nächsten Arena', pt: 'Progresso para a próxima Arena', ja: '次のアリーナへの進捗', ko: '다음 아레나까지 진행도', zh: '下一个竞技场进度', ar: 'التقدم للحلبة التالية', ru: 'Прогресс до следующей арены' },
  'trophy.current': { en: 'CURRENT', es: 'ACTUAL', fr: 'ACTUEL', de: 'AKTUELL', pt: 'ATUAL', ja: '現在', ko: '현재', zh: '当前', ar: 'حالي', ru: 'ТЕКУЩАЯ' },

  // ═══ War Pass ═══
  'warpass.title': { en: 'War Pass', es: 'Pase de Guerra', fr: 'Passe de Guerre', de: 'Kriegspass', pt: 'Passe de Guerra', ja: 'ウォーパス', ko: '워패스', zh: '战争通行证', ar: 'تصريح الحرب', ru: 'Военный пропуск' },
  'warpass.free': { en: 'Free Track', es: 'Ruta Gratuita', fr: 'Piste Gratuite', de: 'Kostenlose Spur', pt: 'Trilha Gratuita', ja: '無料トラック', ko: '무료 트랙', zh: '免费赛道', ar: 'المسار المجاني', ru: 'Бесплатный путь' },
  'warpass.paid': { en: 'War Pass+', es: 'Pase+', fr: 'Passe+', de: 'Pass+', pt: 'Passe+', ja: 'パス+', ko: '패스+', zh: '通行证+', ar: 'تصريح+', ru: 'Пропуск+' },
  'warpass.days_left': { en: 'days left', es: 'días restantes', fr: 'jours restants', de: 'Tage übrig', pt: 'dias restantes', ja: '日残り', ko: '일 남음', zh: '天剩余', ar: 'أيام متبقية', ru: 'дней осталось' },
  'warpass.tier': { en: 'Tier', es: 'Nivel', fr: 'Palier', de: 'Stufe', pt: 'Nível', ja: 'ティア', ko: '티어', zh: '等级', ar: 'المرحلة', ru: 'Уровень' },
  'warpass.unlock': { en: 'Unlock War Pass+', es: 'Desbloquear Pase+', fr: 'Débloquer Passe+', de: 'Pass+ freischalten', pt: 'Desbloquear Passe+', ja: 'パス+を解放', ko: '패스+ 해제', zh: '解锁通行证+', ar: 'فتح التصريح+', ru: 'Разблокировать Пропуск+' },

  // ═══ Chest ═══
  'chest.open': { en: 'Open', es: 'Abrir', fr: 'Ouvrir', de: 'Öffnen', pt: 'Abrir', ja: '開ける', ko: '열기', zh: '打开', ar: 'فتح', ru: 'Открыть' },
  'chest.unlocking': { en: 'Unlocking...', es: 'Desbloqueando...', fr: 'Déverrouillage...', de: 'Wird freigeschaltet...', pt: 'Desbloqueando...', ja: '解放中...', ko: '해제 중...', zh: '解锁中...', ar: 'جاري الفتح...', ru: 'Открывается...' },
  'chest.ready': { en: 'Ready!', es: '¡Listo!', fr: 'Prêt!', de: 'Fertig!', pt: 'Pronto!', ja: '準備完了！', ko: '준비됨!', zh: '准备好了！', ar: 'جاهز!', ru: 'Готово!' },
  'chest.skip': { en: 'Skip', es: 'Saltar', fr: 'Passer', de: 'Überspringen', pt: 'Pular', ja: 'スキップ', ko: '건너뛰기', zh: '跳过', ar: 'تخطي', ru: 'Пропустить' },
  'chest.open_chest': { en: 'OPEN CHEST', es: 'ABRIR COFRE', fr: 'OUVRIR LE COFFRE', de: 'TRUHE ÖFFNEN', pt: 'ABRIR BAÚ', ja: 'チェストを開く', ko: '상자 열기', zh: '打开宝箱', ar: 'فتح الصندوق', ru: 'ОТКРЫТЬ СУНДУК' },
  'chest.contains': { en: 'Contains', es: 'Contiene', fr: 'Contient', de: 'Enthält', pt: 'Contém', ja: '内容', ko: '포함', zh: '包含', ar: 'يحتوي', ru: 'Содержит' },
  'chest.cards': { en: 'cards', es: 'cartas', fr: 'cartes', de: 'Karten', pt: 'cartas', ja: 'カード', ko: '카드', zh: '卡牌', ar: 'بطاقات', ru: 'карт' },
  'chest.rewards': { en: 'REWARDS!', es: '¡RECOMPENSAS!', fr: 'RÉCOMPENSES!', de: 'BELOHNUNGEN!', pt: 'RECOMPENSAS!', ja: '報酬！', ko: '보상!', zh: '奖励！', ar: 'المكافآت!', ru: 'НАГРАДЫ!' },
  'chest.go_back': { en: 'Go Back', es: 'Volver', fr: 'Retour', de: 'Zurück', pt: 'Voltar', ja: '戻る', ko: '돌아가기', zh: '返回', ar: 'رجوع', ru: 'Назад' },

  // ═══ Mailbox ═══
  'mail.title': { en: 'Mailbox', es: 'Buzón', fr: 'Boîte aux lettres', de: 'Postfach', pt: 'Caixa de Correio', ja: 'メールボックス', ko: '우편함', zh: '邮箱', ar: 'صندوق البريد', ru: 'Почта' },
  'mail.new': { en: 'new', es: 'nuevo', fr: 'nouveau', de: 'neu', pt: 'novo', ja: '新着', ko: '새로운', zh: '新', ar: 'جديد', ru: 'новых' },
  'mail.rewards': { en: 'Rewards', es: 'Recompensas', fr: 'Récompenses', de: 'Belohnungen', pt: 'Recompensas', ja: '報酬', ko: '보상', zh: '奖励', ar: 'المكافآت', ru: 'Награды' },
  'mail.claim_rewards': { en: '🎁 Claim Rewards', es: '🎁 Reclamar Recompensas', fr: '🎁 Récupérer', de: '🎁 Belohnungen abholen', pt: '🎁 Resgatar', ja: '🎁 報酬を受取', ko: '🎁 보상 수령', zh: '🎁 领取奖励', ar: '🎁 اطلب المكافآت', ru: '🎁 Забрать награды' },
  'mail.claimed': { en: '✅ Claimed', es: '✅ Reclamado', fr: '✅ Récupéré', de: '✅ Abgeholt', pt: '✅ Resgatado', ja: '✅ 受取済み', ko: '✅ 수령됨', zh: '✅ 已领取', ar: '✅ تم المطالبة', ru: '✅ Забрано' },
  'mail.loading': { en: 'Loading mail...', es: 'Cargando correo...', fr: 'Chargement...', de: 'Wird geladen...', pt: 'Carregando...', ja: 'メール読み込み中...', ko: '메일 로딩 중...', zh: '加载邮件...', ar: 'جاري التحميل...', ru: 'Загрузка почты...' },
  'mail.no_messages': { en: 'No messages yet', es: 'Sin mensajes aún', fr: 'Pas encore de messages', de: 'Noch keine Nachrichten', pt: 'Sem mensagens ainda', ja: 'まだメッセージがありません', ko: '메시지가 아직 없습니다', zh: '还没有消息', ar: 'لا رسائل بعد', ru: 'Пока нет сообщений' },
  'mail.go_social': { en: 'Go to Social Tab →', es: 'Ir a Social →', fr: 'Aller à Social →', de: 'Zum Social Tab →', pt: 'Ir para Social →', ja: 'ソーシャルへ →', ko: '소셜 탭으로 →', zh: '前往社交 →', ar: 'اذهب للاجتماعي →', ru: 'К соцсети →' },

  // ═══ River Race ═══
  'river.title': { en: 'River Race', es: 'Carrera del Río', fr: 'Course de Rivière', de: 'Flussrennen', pt: 'Corrida do Rio', ja: 'リバーレース', ko: '리버 레이스', zh: '河流竞赛', ar: 'سباق النهر', ru: 'Речная гонка' },
  'river.join_clan': { en: 'Join a Clan First!', es: '¡Únete a un clan!', fr: 'Rejoignez un clan!', de: 'Tritt zuerst einem Clan bei!', pt: 'Entre em um clã!', ja: 'まずクランに参加！', ko: '먼저 클랜에 가입하세요!', zh: '先加入部落！', ar: 'انضم لعشيرة أولاً!', ru: 'Вступите в клан!' },
  'river.need_clan': { en: 'You need to be in a clan to participate in River Race.', es: 'Debes estar en un clan para participar.', fr: 'Vous devez être dans un clan pour participer.', de: 'Du musst in einem Clan sein.', pt: 'Você precisa estar em um clã.', ja: 'リバーレースに参加するにはクランが必要です。', ko: '리버 레이스에 참여하려면 클랜이 필요합니다.', zh: '需要加入部落才能参与。', ar: 'يجب أن تكون في عشيرة للمشاركة.', ru: 'Нужно быть в клане для участия.' },
  'river.go_social': { en: 'Go to Social', es: 'Ir a Social', fr: 'Aller au Social', de: 'Zum Social', pt: 'Ir para Social', ja: 'ソーシャルへ', ko: '소셜로', zh: '前往社交', ar: 'اذهب للاجتماعي', ru: 'К соцсети' },
  'river.training': { en: '⛵ Training', es: '⛵ Entrenamiento', fr: '⛵ Entraînement', de: '⛵ Training', pt: '⛵ Treino', ja: '⛵ トレーニング', ko: '⛵ 훈련', zh: '⛵ 训练', ar: '⛵ تدريب', ru: '⛵ Тренировка' },
  'river.battle_day': { en: '⚔️ Battle', es: '⚔️ Batalla', fr: '⚔️ Combat', de: '⚔️ Kampf', pt: '⚔️ Batalha', ja: '⚔️ バトル', ko: '⚔️ 전투', zh: '⚔️ 战斗', ar: '⚔️ معركة', ru: '⚔️ Бой' },
  'river.finish_line': { en: '🏁 Finish Line', es: '🏁 Línea de Meta', fr: '🏁 Ligne d\'Arrivée', de: '🏁 Ziellinie', pt: '🏁 Linha de Chegada', ja: '🏁 ゴール', ko: '🏁 결승선', zh: '🏁 终点线', ar: '🏁 خط النهاية', ru: '🏁 Финиш' },
  'river.war_decks': { en: 'War Decks', es: 'Mazos de Guerra', fr: 'Decks de Guerre', de: 'Kriegsdecks', pt: 'Decks de Guerra', ja: 'ウォーデッキ', ko: '워 덱', zh: '战争卡组', ar: 'مجموعات الحرب', ru: 'Боевые колоды' },

  // ═══ Auth ═══
  'auth.sign_in': { en: 'Sign In', es: 'Iniciar Sesión', fr: 'Se Connecter', de: 'Anmelden', pt: 'Entrar', ja: 'サインイン', ko: '로그인', zh: '登录', ar: 'تسجيل الدخول', ru: 'Войти' },
  'auth.sign_up': { en: 'Sign Up', es: 'Registrarse', fr: 'S\'inscrire', de: 'Registrieren', pt: 'Cadastrar', ja: 'サインアップ', ko: '회원가입', zh: '注册', ar: 'التسجيل', ru: 'Регистрация' },
  'auth.email': { en: 'Email address', es: 'Correo electrónico', fr: 'Adresse e-mail', de: 'E-Mail-Adresse', pt: 'Endereço de e-mail', ja: 'メールアドレス', ko: '이메일 주소', zh: '邮箱地址', ar: 'عنوان البريد الإلكتروني', ru: 'Адрес эл. почты' },
  'auth.password': { en: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort', pt: 'Senha', ja: 'パスワード', ko: '비밀번호', zh: '密码', ar: 'كلمة المرور', ru: 'Пароль' },
  'auth.loading': { en: 'LOADING...', es: 'CARGANDO...', fr: 'CHARGEMENT...', de: 'WIRD GELADEN...', pt: 'CARREGANDO...', ja: '読み込み中...', ko: '로딩 중...', zh: '加载中...', ar: 'جاري التحميل...', ru: 'ЗАГРУЗКА...' },
  'auth.choose_username': { en: 'CHOOSE YOUR NAME', es: 'ELIGE TU NOMBRE', fr: 'CHOISISSEZ VOTRE NOM', de: 'WÄHLE DEINEN NAMEN', pt: 'ESCOLHA SEU NOME', ja: '名前を選択', ko: '이름을 선택하세요', zh: '选择你的名字', ar: 'اختر اسمك', ru: 'ВЫБЕРИТЕ ИМЯ' },
  'auth.sign_in_account': { en: 'Sign in to your account', es: 'Inicia sesión en tu cuenta', fr: 'Connectez-vous à votre compte', de: 'Melde dich in deinem Konto an', pt: 'Entre na sua conta', ja: 'アカウントにサインイン', ko: '계정에 로그인하세요', zh: '登录您的账户', ar: 'سجل الدخول إلى حسابك', ru: 'Войдите в свой аккаунт' },
  'auth.create_account': { en: 'CREATE ACCOUNT', es: 'CREAR CUENTA', fr: 'CRÉER UN COMPTE', de: 'KONTO ERSTELLEN', pt: 'CRIAR CONTA', ja: 'アカウント作成', ko: '계정 생성', zh: '创建账户', ar: 'إنشاء حساب', ru: 'СОЗДАТЬ АККАУНТ' },
  'auth.create_your_account': { en: 'Create your account', es: 'Crea tu cuenta', fr: 'Créez votre compte', de: 'Erstelle dein Konto', pt: 'Crie sua conta', ja: 'アカウントを作成', ko: '계정을 만드세요', zh: '创建您的账户', ar: 'أنشئ حسابك', ru: 'Создайте свой аккаунт' },
  'auth.no_account': { en: "Don't have an account? ", es: '¿No tienes cuenta? ', fr: "Pas de compte ? ", de: 'Kein Konto? ', pt: 'Não tem conta? ', ja: 'アカウントがない？ ', ko: '계정이 없으신가요? ', zh: '没有账户？ ', ar: 'ليس لديك حساب؟ ', ru: 'Нет аккаунта? ' },
  'auth.have_account': { en: 'Already have an account? ', es: '¿Ya tienes cuenta? ', fr: 'Déjà un compte ? ', de: 'Bereits ein Konto? ', pt: 'Já tem conta? ', ja: 'アカウントをお持ちですか？ ', ko: '이미 계정이 있으신가요? ', zh: '已有账户？ ', ar: 'لديك حساب بالفعل؟ ', ru: 'Уже есть аккаунт? ' },
  'auth.or': { en: 'or', es: 'o', fr: 'ou', de: 'oder', pt: 'ou', ja: 'または', ko: '또는', zh: '或', ar: 'أو', ru: 'или' },
  'auth.sign_in_google': { en: 'Sign in with Google', es: 'Iniciar con Google', fr: 'Connexion avec Google', de: 'Mit Google anmelden', pt: 'Entrar com Google', ja: 'Googleでサインイン', ko: 'Google로 로그인', zh: '使用Google登录', ar: 'تسجيل الدخول بـ Google', ru: 'Войти через Google' },
  'auth.sign_in_apple': { en: 'Sign in with Apple', es: 'Iniciar con Apple', fr: 'Connexion avec Apple', de: 'Mit Apple anmelden', pt: 'Entrar com Apple', ja: 'Appleでサインイン', ko: 'Apple로 로그인', zh: '使用Apple登录', ar: 'تسجيل الدخول بـ Apple', ru: 'Войти через Apple' },
  'auth.check_email': { en: 'Check Your Email!', es: '¡Revisa Tu Correo!', fr: 'Vérifiez Votre E-mail!', de: 'Prüfe Deine E-Mail!', pt: 'Verifique Seu E-mail!', ja: 'メールを確認！', ko: '이메일을 확인하세요!', zh: '查看您的邮件！', ar: 'تحقق من بريدك!', ru: 'Проверьте почту!' },
  'auth.confirmation_sent': { en: 'We sent a confirmation link to', es: 'Enviamos un enlace de confirmación a', fr: 'Nous avons envoyé un lien de confirmation à', de: 'Wir haben einen Bestätigungslink gesendet an', pt: 'Enviamos um link de confirmação para', ja: '確認リンクを送信しました：', ko: '확인 링크를 보냈습니다:', zh: '我们已发送确认链接至', ar: 'أرسلنا رابط التأكيد إلى', ru: 'Мы отправили ссылку на' },
  'auth.back_sign_in': { en: 'Back to Sign In', es: 'Volver a Iniciar Sesión', fr: 'Retour à la Connexion', de: 'Zurück zur Anmeldung', pt: 'Voltar ao Login', ja: 'サインインに戻る', ko: '로그인으로 돌아가기', zh: '返回登录', ar: 'العودة لتسجيل الدخول', ru: 'Вернуться к входу' },
  'auth.warrior_name': { en: 'This is your warrior name. Choose wisely —', es: 'Este es tu nombre de guerrero. Elige bien —', fr: 'Votre nom de guerrier. Choisissez bien —', de: 'Dein Kriegername. Wähle weise —', pt: 'Este é seu nome de guerreiro. Escolha bem —', ja: 'これはあなたの戦士の名前です。慎重に選んでください —', ko: '이것은 당신의 전사 이름입니다. 신중하게 선택하세요 —', zh: '这是你的战士名字。请慎重选择 —', ar: 'هذا اسم محاربك. اختر بحكمة —', ru: 'Это ваше имя воина. Выбирайте мудро —' },
  'auth.once_chosen': { en: 'once chosen, it\'s yours forever', es: 'una vez elegido, es tuyo para siempre', fr: 'une fois choisi, c\'est le vôtre pour toujours', de: 'einmal gewählt, gehört er dir für immer', pt: 'uma vez escolhido, é seu para sempre', ja: '一度選ぶと永遠にあなたのものです', ko: '한 번 선택하면 영원히 당신의 것입니다', zh: '一旦选择，永远是你的', ar: 'بمجرد الاختيار، سيكون لك إلى الأبد', ru: 'выбрав, оно ваше навсегда' },
  'auth.enter_username': { en: 'Enter username (3-20 characters)', es: 'Nombre de usuario (3-20 caracteres)', fr: "Nom d'utilisateur (3-20 caractères)", de: 'Benutzername (3-20 Zeichen)', pt: 'Nome de usuário (3-20 caracteres)', ja: 'ユーザー名 (3-20文字)', ko: '사용자 이름 (3-20자)', zh: '用户名 (3-20个字符)', ar: 'اسم المستخدم (3-20 حرف)', ru: 'Имя пользователя (3-20 символов)' },
  'auth.lock_in': { en: 'LOCK IN NAME', es: 'CONFIRMAR NOMBRE', fr: 'VERROUILLER LE NOM', de: 'NAMEN SPERREN', pt: 'CONFIRMAR NOME', ja: '名前を確定', ko: '이름 확정', zh: '确认名字', ar: 'تأكيد الاسم', ru: 'ПОДТВЕРДИТЬ ИМЯ' },
  'auth.permanent': { en: 'permanent', es: 'permanente', fr: 'permanent', de: 'permanent', pt: 'permanente', ja: '永続的', ko: '영구적', zh: '永久的', ar: 'دائم', ru: 'постоянное' },
  'auth.min_chars': { en: 'Minimum 3 characters', es: 'Mínimo 3 caracteres', fr: 'Minimum 3 caractères', de: 'Mindestens 3 Zeichen', pt: 'Mínimo 3 caracteres', ja: '最低3文字', ko: '최소 3자', zh: '最少3个字符', ar: 'الحد الأدنى 3 أحرف', ru: 'Минимум 3 символа' },

  // ═══ Common ═══
  'common.back': { en: 'Back', es: 'Volver', fr: 'Retour', de: 'Zurück', pt: 'Voltar', ja: '戻る', ko: '뒤로', zh: '返回', ar: 'رجوع', ru: 'Назад' },
  'common.close': { en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', pt: 'Fechar', ja: '閉じる', ko: '닫기', zh: '关闭', ar: 'إغلاق', ru: 'Закрыть' },
  'common.ok': { en: 'OK', es: 'OK', fr: 'OK', de: 'OK', pt: 'OK', ja: 'OK', ko: 'OK', zh: '确定', ar: 'موافق', ru: 'ОК' },
  'common.yes': { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', pt: 'Sim', ja: 'はい', ko: '예', zh: '是', ar: 'نعم', ru: 'Да' },
  'common.no': { en: 'No', es: 'No', fr: 'Non', de: 'Nein', pt: 'Não', ja: 'いいえ', ko: '아니오', zh: '否', ar: 'لا', ru: 'Нет' },
  'common.you': { en: 'You', es: 'Tú', fr: 'Vous', de: 'Du', pt: 'Você', ja: 'あなた', ko: '당신', zh: '你', ar: 'أنت', ru: 'Вы' },
  'common.level': { en: 'Level', es: 'Nivel', fr: 'Niveau', de: 'Stufe', pt: 'Nível', ja: 'レベル', ko: '레벨', zh: '等级', ar: 'المستوى', ru: 'Уровень' },
  'common.claim': { en: 'Claim', es: 'Reclamar', fr: 'Récupérer', de: 'Abholen', pt: 'Resgatar', ja: '受取', ko: '수령', zh: '领取', ar: 'مطالبة', ru: 'Забрать' },
  'common.confirm': { en: 'Confirm', es: 'Confirmar', fr: 'Confirmer', de: 'Bestätigen', pt: 'Confirmar', ja: '確認', ko: '확인', zh: '确认', ar: 'تأكيد', ru: 'Подтвердить' },
  'common.loading': { en: 'Loading...', es: 'Cargando...', fr: 'Chargement...', de: 'Wird geladen...', pt: 'Carregando...', ja: '読み込み中...', ko: '로딩 중...', zh: '加载中...', ar: 'جاري التحميل...', ru: 'Загрузка...' },

  // ═══ Rarity ═══
  'rarity.common': { en: 'Common', es: 'Común', fr: 'Commun', de: 'Gewöhnlich', pt: 'Comum', ja: 'コモン', ko: '일반', zh: '普通', ar: 'عادي', ru: 'Обычная' },
  'rarity.rare': { en: 'Rare', es: 'Rara', fr: 'Rare', de: 'Selten', pt: 'Rara', ja: 'レア', ko: '레어', zh: '稀有', ar: 'نادر', ru: 'Редкая' },
  'rarity.epic': { en: 'Epic', es: 'Épica', fr: 'Épique', de: 'Episch', pt: 'Épica', ja: 'エピック', ko: '에픽', zh: '史诗', ar: 'ملحمي', ru: 'Эпическая' },
  'rarity.legendary': { en: 'Legendary', es: 'Legendaria', fr: 'Légendaire', de: 'Legendär', pt: 'Lendária', ja: 'レジェンダリー', ko: '전설', zh: '传奇', ar: 'أسطوري', ru: 'Легендарная' },
  'rarity.champion': { en: 'Champion', es: 'Campeón', fr: 'Champion', de: 'Champion', pt: 'Campeão', ja: 'チャンピオン', ko: '챔피언', zh: '冠军', ar: 'بطل', ru: 'Чемпион' },
};

// Get a translation by key
export function t(key: string, lang: Language = 'en'): string {
  const entry = translations[key];
  if (!entry) return key; // Fallback to key
  return entry[lang] || entry.en || key;
}

// Translation helper for card type
export function tCardType(type: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    troop: { en: 'Troop', es: 'Tropa', fr: 'Troupe', de: 'Truppe', pt: 'Tropa', ja: 'ユニット', ko: '유닛', zh: '部队', ar: 'جندي', ru: 'Отряд' },
    spell: { en: 'Spell', es: 'Hechizo', fr: 'Sort', de: 'Zauber', pt: 'Feitiço', ja: '呪文', ko: '주문', zh: '法术', ar: 'تعويذة', ru: 'Заклинание' },
    building: { en: 'Building', es: 'Edificio', fr: 'Bâtiment', de: 'Gebäude', pt: 'Construção', ja: '建物', ko: '건물', zh: '建筑', ar: 'مبنى', ru: 'Здание' },
  };
  return map[type]?.[lang] || map[type]?.en || type;
}

// Translation helper for arena names
export function tArena(arenaName: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    'Boot Camp': { en: 'Boot Camp', es: 'Campo de Entrenamiento', fr: 'Camp d\'Entraînement', de: 'Ausbildungslager', pt: 'Campo de Treino', ja: 'ブートキャンプ', ko: '부트 캠프', zh: '新兵训练营', ar: 'معسكر التدريب', ru: 'Учебный лагерь' },
    'Bronze Trenches': { en: 'Bronze Trenches', es: 'Trincheras de Bronce', fr: 'Tranchées de Bronze', de: 'Bronzegräben', pt: 'Trincheiras de Bronze', ja: 'ブロンズ塹壕', ko: '브론즈 참호', zh: '青铜战壕', ar: 'خنادق البرونز', ru: 'Бронзовые окопы' },
    'Fallen Ruins': { en: 'Fallen Ruins', es: 'Ruinas Caídas', fr: 'Ruines Déchues', de: 'Gefallene Ruinen', pt: 'Ruínas Caídas', ja: '朽ちた遺跡', ko: '무너진 폐허', zh: '堕落废墟', ar: 'الأطلال المتساقطة', ru: 'Павшие руины' },
  };
  return map[arenaName]?.[lang] || arenaName;
}

// Translation helper for rarity
export function tRarity(rarity: string, lang: Language): string {
  const key = `rarity.${rarity}`;
  return t(key, lang);
}
