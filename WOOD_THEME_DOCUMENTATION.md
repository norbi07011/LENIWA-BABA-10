# 🪵 GURALSKI DREWNIANY MOTYW - Dokumentacja

## 🎨 Paleta Kolorów

### Główne Kolory Drewna
```css
--wood-primary: #654321      /* Ciemny brąz orzecha */
--wood-secondary: #D2691E    /* Chocolate góralski */
--wood-accent: #CD853F       /* Peru - ciepły accent */
--wood-highlight: #DEB887    /* Burlywood - jasne drewno */
--wood-text: #F5DEB3         /* Wheat - ciepły tekst */
--wood-text-dark: #8B4513    /* Saddle Brown */
```

### Tło Główne
- **Kolor bazowy**: `#8B6F47` (Ciepły brąz brzozowy)
- **Wzór**: Naturalne słoje drewna z góralskimi akcentami
- **Efekt**: 3-warstwowy gradient z liniami imitującymi strukturę drewna

## 📐 Struktura Motywu

### 1. **Backgrounds (Tła)**

#### Primary (Header/Footer)
```css
background: linear-gradient(
  135deg,
  rgba(101, 67, 33, 0.98) 0%,    /* Ciemny orzech */
  rgba(80, 50, 25, 0.98) 50%,     /* Głębszy brąz */
  rgba(101, 67, 33, 0.98) 100%    /* Powrót do orzecha */
)
box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3)
```
**Efekt**: Ciemne orzechowe drewno z subtelnym wklęsłym cieniem

#### Secondary (Cards)
```css
background: linear-gradient(
  160deg,
  rgba(210, 180, 140, 0.95) 0%,   /* Tan */
  rgba(222, 184, 135, 0.95) 50%,  /* Burlywood */
  rgba(205, 170, 125, 0.95) 100%  /* Cieplejszy tan */
)
border: 2px solid rgba(139, 111, 71, 0.3)
box-shadow: 
  inset 0 1px 2px rgba(255, 255, 255, 0.2),
  0 2px 8px rgba(0, 0, 0, 0.15)
```
**Efekt**: Jasne brzozowe drewno z naturalnymi obrzeżami

#### Glass Cards
```css
background: linear-gradient(
  135deg,
  rgba(222, 184, 135, 0.4) 0%,
  rgba(210, 180, 140, 0.3) 100%
)
backdrop-filter: blur(12px)
border: 1px solid rgba(205, 133, 63, 0.3)
box-shadow: 0 8px 32px rgba(101, 67, 33, 0.2)
```
**Efekt**: Przezroczyste drewno z efektem głębi

### 2. **Typography (Tekst)**

#### Primary Text
- **Kolor**: `#F5DEB3` (Wheat)
- **Text-shadow**: `1px 1px 2px rgba(0, 0, 0, 0.3)`
- **Efekt**: Ciepły pszeniczny tekst z subtelnym cieniem

#### Secondary Text
- **Kolor**: `rgba(245, 222, 179, 0.85)`
- **Efekt**: Jaśniejsza pszenica z przezroczystością

#### White Text
- **Kolor**: `#FFFAF0` (Floral White)
- **Text-shadow**: `1px 1px 2px rgba(0, 0, 0, 0.4)`
- **Efekt**: Najjaśniejszy tekst z mocniejszym cieniem

### 3. **Accents (Akcenty)**

#### Folk Red Replacement
```css
color: #D2691E (Chocolate)
text-shadow: 0 0 10px rgba(210, 105, 30, 0.4)
```
**Hover**: `#CD853F` (Peru)

#### Buttons
```css
background: linear-gradient(
  135deg,
  rgba(210, 105, 30, 0.9) 0%,
  rgba(205, 133, 63, 0.9) 100%
)
border: 2px solid rgba(222, 184, 135, 0.3)
box-shadow: 
  0 4px 15px rgba(101, 67, 33, 0.3),
  inset 0 1px 2px rgba(255, 255, 255, 0.2)
```
**Hover**:
```css
background: linear-gradient(
  135deg,
  rgba(205, 133, 63, 1) 0%,
  rgba(222, 184, 135, 1) 100%
)
box-shadow: 
  0 6px 20px rgba(210, 105, 30, 0.5),
  inset 0 1px 3px rgba(255, 255, 255, 0.3)
```

### 4. **Premium Effects**

#### Gradient Text
```css
background: linear-gradient(
  135deg,
  #D2691E 0%,      /* Chocolate */
  #CD853F 25%,     /* Peru */
  #DEB887 50%,     /* Burlywood */
  #CD853F 75%,     /* Peru */
  #D2691E 100%     /* Chocolate */
)
filter: drop-shadow(0 2px 4px rgba(210, 105, 30, 0.4))
```

#### Glow Effect
```css
text-shadow: 
  0 0 20px rgba(222, 184, 135, 0.6),
  0 0 40px rgba(205, 133, 63, 0.4),
  0 2px 4px rgba(0, 0, 0, 0.3)
```

#### Shadow Premium
```css
box-shadow: 
  0 10px 40px rgba(101, 67, 33, 0.3),
  0 4px 15px rgba(139, 111, 71, 0.2),
  inset 0 1px 2px rgba(255, 255, 255, 0.1)
```

#### Card 3D
```css
transform: translateY(-8px) rotateX(2deg)
box-shadow: 
  0 20px 60px rgba(101, 67, 33, 0.4),
  0 8px 20px rgba(139, 111, 71, 0.3)
```

### 5. **Forms (Formularze)**

#### Inputs
```css
background: rgba(245, 222, 179, 0.15)
border: 2px solid rgba(139, 111, 71, 0.4)
color: #F5DEB3
```

#### Focus State
```css
border-color: #CD853F
box-shadow: 0 0 15px rgba(205, 133, 63, 0.4)
```

## 🎭 Efekty Specjalne

### Shimmer Animation
```css
@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
animation: shimmer 3s linear infinite;
```

### Wood Grain Pattern
- **Vertical Lines**: `rgba(101, 67, 33, 0.1)` - co 8px
- **Horizontal Gradient**: Trzywarstwowy gradient imitujący naturalne słoje
- **Całkowity Efekt**: Autentyczna struktura drewna brzozowego

## 🎯 Użycie

### Aktywacja Motywu
```typescript
// W ThemeToggle lub AppContext
setTheme('wood')
```

### HTML Class
```html
<html class="dark theme-wood">
```

### CSS Targeting
```css
.theme-wood .your-element {
  /* Style specyficzne dla wood theme */
}
```

## 🌟 Cechy Charakterystyczne

1. **Autentyczność**: Inspirowane prawdziwym drewnem góralskim
2. **Ciepło**: Dominują ciepłe brązy, tan, burlywood
3. **Naturalne Tekstury**: Wzory imitujące słoje drewna
4. **Głębia**: Multi-layer shadows i inset effects
5. **Złote Akcenty**: Chocolate i Peru zamiast czerwieni
6. **Czytelność**: Wysoky kontrast tekst na drewnie

## 📱 Responsywność

Motyw automatycznie adaptuje się do:
- Desktop (pełna tekstura drewna)
- Tablet (uproszczone gradienty)
- Mobile (zoptymalizowane cienie)

## ♿ Accessibility

- **Contrast Ratio**: >= 4.5:1 (WCAG AA)
- **Text Shadow**: Poprawia czytelność na ciemnym tle
- **Focus States**: Wyraźne złote obramowania
- **Hover Effects**: Subtelne ale widoczne

## 🔧 Customizacja

Aby zmienić odcień drewna, edytuj zmienne CSS:
```css
.theme-wood {
  --wood-primary: #YOUR_COLOR;
  --wood-accent: #YOUR_COLOR;
}
```

## 🎨 Inspiracja

Motyw inspirowany:
- Góralskimi chatami z Zakopanego
- Tradycyjnymi polskimi meblami drewnianymi
- Naturalnymi słojami drewna brzozowego i orzechowego
- Ciepłymi tonami polskiej przyrody

---

**Created**: 2025-10-03  
**Version**: 2.0 (Guralski Edition)  
**Author**: Leniwa Baba Development Team 🪵✨
