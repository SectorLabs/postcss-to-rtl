/* eslint max-len:0 */
import postcss from 'postcss';
import test    from 'ava';
import plugin from './';

/* Write tests here */

test('Checks initial configuration', t => {
    const input = 'a{ color: red }';
    const output = 'a{ color: red }';

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Supports rtlcss control directives', t => {
    const input = 'a{ /*rtl:ignore*/left: 0 }';
    const output = 'a{ /*rtl:ignore*/left: 0 }';

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks basic example', t => {
    const input = `
a {
    float: left
}`;

    const output = `
a {
    float: right
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example with two properties which should both be converted', t => {
    const input = `
a {
    float: left;
    transform: translateX(50%);
}`;

    const output = `
a {
    float: right;
    transform: translateX(-50%);
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example with two properties out of which only one should be converted', t => {
    const input = `
a {
    color: red;
    transform: translateX(50%);
}`;

    const output = `
a {
    color: red;
    transform: translateX(-50%);
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example with three properties where the first and third should be converted', t => {
    const input = `
a {
    transform: translateX(50%);
    color: red;
    border-left: 10px;
}`;

    const output = `
a {
    transform: translateX(-50%);
    color: red;
    border-right: 10px;
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example with "composes" keyword', t => {
    const input = `
a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
a {
    composes: foo;
    transform: translateX(-50%);
    color: red;
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example with multiple selectors', t => {
    const input = `
.a, .b {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
.a, .b {
    composes: foo;
    transform: translateX(-50%);
    color: red;
}`;
    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example where selectors already have ltr styles defined', t => {
    const input = `
html[dir="ltr"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
html[dir="ltr"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example where selectors already have styles defined for both directions html[dir]', t => {
    const input = `
html[dir] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
html[dir] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example where selectors already have rtl styles defined', t => {
    const input = `
html[dir="rtl"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
html[dir="rtl"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks example where selectors have [dir="*"] defined', t => {
    const input = `
[dir="rtl"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    const output = `
[dir="rtl"] .a {
    composes: foo;
    transform: translateX(50%);
    color: red;
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Check @media tag parsing', t => {
    const input = `
@media screen and (max-width:632px) {
    .a {
        float: left;
    }
}`;

    const output = `
@media screen and (max-width:632px) {
    .a {
        float: right;
    }
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});

test('Checks keyframe parsing', t => {
    const input = `
@keyframes moveLeft {
    from {
        transform: translateX(10px);
    }
    to {
        transform: translateX(0);
    }
}`;

    const output = `@keyframes moveLeft-rtl {
    from {
        transform: translateX(-10px);
    }
    to {
        transform: translateX(0);
    }
}
@keyframes moveLeft {
    from {
        transform: translateX(10px);
    }
    to {
        transform: translateX(0);
    }
}`;

    return postcss([plugin()]).process(input)
        .then( result => {
            t.is(result.css, output);
        });
});
