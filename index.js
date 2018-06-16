var postcss = require('postcss');
var rtlcss = require('rtlcss');

module.exports = postcss.plugin('postcss-to-rtl', function (opts) {
    opts = opts || {};

    // Check if there is an ignore parameter (full selectors to ignore)
    var ignoreRegex = opts.ignore || null;
    if (!ignoreRegex || ignoreRegex.constructor !== RegExp) {
        ignoreRegex = null;
    }

    return function (css) {

        // Save animation names
        var keyFrameNamesToChange = [];
        css.walkAtRules(/keyframes/i, function (atRule) {
            if (keyFrameNamesToChange.indexOf(atRule.params) < 0) {
                keyFrameNamesToChange.push(atRule.params);
            }
        });

        // Generate rtl animation declarations
        css.walkAtRules(/keyframes/i, function (atRule) {
            var newAtRule = atRule.clone();
            newAtRule.params += '-rtl';
            newAtRule = postcss([rtlcss]).process(newAtRule).root;
            atRule.parent.insertBefore(atRule, newAtRule);
        });

        /*
         * Go through all 'animation' or 'animation-name' css declarations
         * If you find an animation name that was converted to rtl above,
         * tell rtlcss to append '-rtl' to the end of the animation name.
         */
        css.walkDecls(/animation$|animation-name/i, function (decl) {
            keyFrameNamesToChange.forEach(function (element) {
                var animationNamePosition = decl.value.indexOf(element);
                if (animationNamePosition > -1) {
                    animationNamePosition += element.length;

                    // Check if the name is complete
                    if (!decl.value[animationNamePosition] ||
                        decl.value[animationNamePosition]
                            .match(/\,|\ |\;|\!/)) {
                        decl.value =
                            [decl.value.slice(0, animationNamePosition),
                                '/*rtl:insert:-rtl*/',
                                decl.value.slice(animationNamePosition)]
                            .join('');
                    }
                }
            });
        });

        css.walkRules(function (rule) {

            // Do we have any selector that starts with 'html'
            // or a selector that already specifies ltr/rtl values
            if (rule.selectors.some(function (selector) {
                return selector.indexOf('html') === 0 ||
                    /^\[dir=['"]?(ltr|rtl)['"]?\]/i.test(selector);
            })) {
                return;
            }

            // Filter rules
            if (ignoreRegex && ignoreRegex.test(rule.selector)) {
                return;
            }

            // If we're inside @rule and it's not
            // a media tag, do not parse
            if (rule.parent.type === 'atrule' &&
                !(rule.parent.name.indexOf('media') > -1)) {
                return;
            }

            var rtl = postcss([rtlcss]).process(rule).root;

            // Go through declarations
            for (var declIndex = rule.nodes.length - 1;
                 declIndex >= 0; --declIndex) {
                if (rule.nodes[declIndex].type !== 'decl') {
                    continue;
                }
                if (rtl.nodes[0].nodes[declIndex] === undefined) {
                    continue;
                }

                var decl = rule.nodes[declIndex];
                var rtlDecl = rtl.nodes[0].nodes[declIndex];
                var rtlValue = rtlDecl.raws.value && rtlDecl.raws.value.raw ?
                    rtlDecl.raws.value.raw : rtlDecl.value;

                if (rtlDecl.prop !== decl.prop || rtlValue !== decl.value) {
                    decl.value = rtlValue;
                    decl.prop = rtlDecl.prop;
                }
            }

            // If we're left with an empty rule (with no declarations)
            if (rule.some(function (node) {
                return node.type === 'decl';
            }) === false) {
                rule.parent.removeChild(rule);
            }
        });

        // Clean up /*rtl:insert:-rtl*/ comments
        css.walkDecls(/animation$|animation-name/i, function (decl) {
            decl.value = decl.value.replace(/\/\*rtl\:insert\:\-rtl\*\//gi,
                                            '');
        });
    };
});
