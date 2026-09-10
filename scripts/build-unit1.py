"""Build the two practice decks from the user's original term pairs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
pairs = [line.split('\t') for line in (ROOT / 'data/unit-1-source.tsv').read_text().splitlines() if line]

groups = {
    'Pronouns': 'yo|tú|él / ella|nosotros|ustedes|ellos',
    'Questions & answers': '¿qué?|¿cómo?|¿quién?|¿cuándo?|¿dónde?|¿por qué?|porque',
    'Verbs – Essentials': 'ser, estar|tener|ir|hacer|querer|poder|gustar|necesitar|saber',
    'Verbs – School & communication': 'hablar|escuchar|mirar, ver|leer|escribir|estudiar|participar|practicar|aprender|preguntar|pensar|entender, comprender|hacer la tarea',
    'Verbs – Activities & everyday actions': 'trabajar|vivir|jugar|usar|visitar|pasar|correr|caminar|comprar|terminar|esperar|empezar, comenzar|ganar|llegar|salir|volver|descansar|limpiar|preparar',
    'Verbs – Food & meals': 'comer|beber|desayunar|almorzar|cenar',
    'Verbs – Sleep & waking up': 'dormir|despertarse|levantarse|acostarse|dormirse',
    'Bathroom & personal care': 'ducharse|bañarse|lavarse la cara|lavarse las manos|cepillarse los dientes|cepillarse el pelo|peinarse|afeitarse|maquillarse',
    'Verbs – Getting dressed & ready': 'vestirse|ponerse|quitarse|prepararse',
    'Verbs – Feelings & other reflexives': 'sentirse|quedarse|acordarse',
    'Sequence & transitions': 'primero|antes|después, luego, más tarde|Más tarde/luego/después|por último',
    'Time & frequency': 'todos los días, cada día|por la mañana|por la tarde|por la noche|siempre|a veces|nunca|temprano|tarde|el tiempo libre',
    'People, things & additions': 'algo|alguien|nada|nadie|también',
}
categories = {term: category for category, terms in groups.items() for term in terms.split('|')}
assert len(categories) == len(pairs) == 100
vocabulary = [dict(category=categories[spanish], spanish=spanish, english=english) for english, spanish in pairs]
deck = dict(title='PIB Spanish 2 – Unit 1', source='User-pasted Quizlet terms', sourceUrl='https://quizlet.com/1206064400/vocabulary-practice-for-quiz-unit-1-flash-cards/', expectedSourceCount=113, receivedSourceCount=len(pairs), categoryOrder=list(groups), vocabulary=vocabulary)
(ROOT / 'data/vocabulary.json').write_text(json.dumps(deck, ensure_ascii=False, indent=2) + '\n')

endings = {'ar': ['o', 'as', 'a', 'amos', 'áis', 'an'], 'er': ['o', 'es', 'e', 'emos', 'éis', 'en'], 'ir': ['o', 'es', 'e', 'imos', 'ís', 'en']}
irregular = {
    'ser': ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    'estar': ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    'ir': ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    'tener': ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    'hacer': ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    'saber': ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
    'ver': ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    'poner': ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
    'salir': ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
}
stems = {
    'querer': ('quier', 'e → ie'), 'poder': ('pued', 'o → ue'),
    'jugar': ('jueg', 'u → ue'), 'dormir': ('duerm', 'o → ue'),
    'pensar': ('piens', 'e → ie'), 'empezar': ('empiez', 'e → ie'),
    'comenzar': ('comienz', 'e → ie'), 'entender': ('entiend', 'e → ie'),
    'despertar': ('despiert', 'e → ie'), 'acostar': ('acuest', 'o → ue'),
    'vestir': ('vist', 'e → i'), 'sentir': ('sient', 'e → ie'),
    'acordar': ('acuerd', 'o → ue'), 'almorzar': ('almuerz', 'o → ue'),
    'volver': ('vuelv', 'o → ue'),
}
reflexives = ['me', 'te', 'se', 'nos', 'os', 'se']
verbs = []
for english, spanish in pairs:
    if not (english.startswith('To ') or english.startswith('Can /')):
        continue
    for phrase in spanish.split(', '):
        token, _, complement = phrase.partition(' ')
        reflexive = token.endswith('se')
        base = token[:-2] if reflexive else token
        if base == 'gustar':
            for plural in [False, True]:
                obj = 'los libros' if plural else 'el libro'
                forms = [f'{p} {"gustan" if plural else "gusta"}' for p in ['me', 'te', 'le', 'nos', 'os', 'les']]
                verbs.append(dict(infinitive='gustar' + (' (plural things)' if plural else ' (one thing)'), base='gustar', meaning='to like', type='special', reflexive=False, forms=forms, subjects=[f'{person} · {obj}' for person in ['a mí', 'a ti', 'a él / a ella / a usted', 'a nosotros / a nosotras', 'a vosotros / a vosotras', 'a ellos / a ellas / a ustedes']], explanation='The thing liked is the grammatical subject: gusta for one thing or an infinitive, gustan for plural things. Use me, te, le, nos, os, or les for the person who likes it. Enter the pronoun and verb only.'))
            continue
        stem = base[:-2]
        kind = 'regular'
        explanation = f'Regular -{base[-2:]} present-tense endings.'
        forms = [stem + ending for ending in endings[base[-2:]]]
        if base in stems:
            changed, pattern = stems[base]
            kind = 'stem'
            forms = [(stem if i in (3, 4) else changed) + ending for i, ending in enumerate(endings[base[-2:]])]
            explanation = f'{pattern} in the stressed stem. Nosotros and vosotros keep {stem}-.'
        if base in irregular:
            kind = 'irregular'
            forms = irregular[base]
            explanation = f'Irregular present tense: {", ".join(forms)}.'
            if base == 'tener':
                explanation += ' Yo uses tengo; tú, él/ella/usted, and ellos/ellas/ustedes also change e → ie.'
        if reflexive:
            forms = [f'{pronoun} {form}' for pronoun, form in zip(reflexives, forms)]
            explanation += ' Match the reflexive pronoun to the subject: me, te, se, nos, os, se.'
        if complement:
            forms = [f'{form} {complement}' for form in forms]
            explanation += f' Keep “{complement}” after the verb.'
        verbs.append(dict(infinitive=phrase, base=base, meaning=english.lower(), type=kind, reflexive=reflexive, stemChanging=base in stems or base == 'tener', explanation=explanation, forms=forms))

(ROOT / 'js/verbs-data.mjs').write_text('// Generated by scripts/build-unit1.py from the supplied Unit 1 list.\nexport const verbs = ' + json.dumps(verbs, ensure_ascii=False, indent=2) + ';\n')
print(f'Built {len(vocabulary)} vocabulary cards across {len(groups)} sections and {len(verbs)} verb drills.')
