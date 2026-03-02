# Dhani Finance Theme Tweaking Guide

This guide explains how to easily customize the micro-level appearance of your application. The entire app's visual identity is controlled centrally via the `src/index.css` file. 

By changing a few values in that file, the entire app (Login, Admin, User dashboards) will automatically update.

---

## 🎨 Where to Edit

Open the file located at: `src/index.css`

At the very top of the file, you will see a `:root` block surrounded by `@layer base { ... }`. This is your **configuration center**.

---

## 1. Changing Colors

Most colors in this app use the **HSL** format to support dynamic Opacity/Alpha features in Tailwind CSS.
HSL stands for: `Hue Saturation Lightness`.
*Example:* `210 100% 20%` (Navy Blue)

Need a new HSL color? Pick one easily here: [HSL Color Picker](https://hslpicker.com/)

### The Core Colors

*   **`--primary`**: This controls the main brand color. It affects the Login button, the Top headers, the "Edit" buttons, and focus rings around input fields.
    *   *Default*: `210 100% 20%` (Deep Navy)
    *   *To make it Red*: Change to `0 100% 40%`
*   **`--success`**: Controls positive actions like the "Share" button, "Create User" button, and the Available Balance text on the dashboards.
    *   *Default*: `160 84% 39%` (Emerald Green)
*   **`--background`**: The main backdrop color behind your white cards.
    *   *Default*: `210 20% 98%` (Very light slate white)
*   **`--grid-color`**: The color of the tiny dots forming the premium texture effect in the background. If you want the dots stronger, darken this hex code.
    *   *Default*: `#cbd5e1`

### 1.1 Tweak Opacity (Transparency)

Because we define colors as raw HSL values (e.g., `210 100% 20%`), you can easily control how "see-through" a color is.

In CSS, if you want a custom element to use the primary color at 50% transparency, you write:
`background: hsl(var(--primary) / 0.5);`

In the code, we use **Tailwind**, which makes it even easier. You can change the opacity of any element just by adding a slash and a number (0 to 100) to the class:
*   `bg-primary/10` -> Very faint primary background (10% visible).
*   `bg-primary/50` -> Semi-transparent (50% visible).
*   `text-primary/80` -> Slightly faded text.

This is very useful for hover effects and "soft" backgrounds!

---

## 2. Changing Shapes (Corner Rounding)

Want the app to look sharper? Or much more bubbly and rounded?

Look for the **`--radius`** property in `src/index.css`.

This single variable controls the corner roundness of EVERY Card, Button, Input Field, and Modal in the app.

*   `--radius: 0.25rem;` -> Very sharp, corporate look.
*   `--radius: 0.75rem;` -> The default balance (modern banking look).
*   `--radius: 1.5rem;` -> Extremely round, bubbly, playful look.

---

## 3. Changing Text Size

Look for the **`--base-font-size`** property.

*   *Default*: `16px`
*   If you find the text too small on mobile, change this strictly to `18px`.
*   If you want to fit more data on screen, change this to `14px`.

---

## 4. How the Magic Works

The app uses **Tailwind CSS**. We told Tailwind (inside `tailwind.config.ts`) to look at your `src/index.css` file. 

So when a button has the class `bg-primary`, it says: "Hey CSS, what is `--primary` set to right now?", grabs that exact color, and applies it. It is incredibly robust and prevents having to manually search-and-replace colors across 50 different files.

## Summary Checklist to Tweak:
1. Open `src/index.css`
2. Scroll to `:root`
3. Change an HSL number, `--radius`, or `--base-font-size`.
4. Save the file.
5. The dev server will instantly refresh and your whole app will look different!
