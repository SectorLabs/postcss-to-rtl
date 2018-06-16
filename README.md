# PostCSS to Rtl [![Build Status][ci-img]][ci]

[PostCSS] plugin to convert (left to right) CSS to RTL.

Enables projects that serve their CSS inlined in a style tag in the documents to build smaller, separate RTL and LTR CSS files for the LTR and RTL pages.

Use this instead of [postcss-inline-rtl] or other postcss pluging that produce
a big CSS files containing rules for both directions.

To get even smaller files, use [css-byebye] to further strip the rules with the wrong direction from the resulting CSS.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/jakob101/postcss-inline-rtl.svg
[ci]:      https://travis-ci.org/jakob101/postcss-inline-rtl
[postcss-inline-rtl]: https://github.com/jakob101/postcss-inline-rtl
[css-byebye]: https://github.com/AoDev/css-byebye

## Recomandation
Always have a `dir="ltr"` or `dir="rtl"` in your HTML tag.

## Examples

```css
/*  Normal code */
.class {
  color: red;
}

/*  => no change */
```

```css
.class{
  border-left: 10px;
  color: red;
}

/*  Converts to: */
.class {
  border-right: 10px
  color: red;
}
```

## Usage

```js
postcss([ require('postcss-to-rtl') ])
```

## Cred
+1 for [postcss-inline-rtl]( as this wouldn't exist without it!

See [PostCSS] docs for examples for your environment.
