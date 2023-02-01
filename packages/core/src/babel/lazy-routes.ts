// @ts-ignore
import syntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';

export default (api: any) => {
  const { types: t } = api;
  return {
    inherits: syntaxDynamicImport.default,
    visitor: {
      Program: {
        enter(programPath: any) {
          programPath.traverse({
            CallExpression(path: any) {
              if (!path.isCallExpression()) {
                return;
              }
              const source = path.get('arguments.0')?.node?.value;
              if (!source) {
                return;
              }
              // const source = path.parentPath.node.arguments[0].value;
              if (
                path.parent?.type !== 'ArrowFunctionExpression' &&
                path.parentPath?.parent?.type !== 'ObjectProperty' &&
                path.parentPath?.parent?.key?.name === 'component'
              ) {
                return;
              }
              const callPaths: any[] = [];
              path.traverse({
                Import(importPath: any) {
                  callPaths.push(importPath.parentPath);
                },
              });
              if (callPaths.length === 0) return;

              // Multiple imports call is not supported
              if (callPaths.length > 1) {
                throw new Error(
                  'ReactPWA: multiple import calls inside for routes function are not supported.',
                );
              }

              try {
                const obj = path.parentPath.parentPath;
                const propertiesMap: any = {};
                if (!obj.container || !obj.container.length) {
                  return;
                }
                obj.container.forEach((property: any) => {
                  propertiesMap[property.key.name] = property.value.value;
                });

                const moduleObj = t.objectProperty(
                  t.identifier('module'),
                  t.arrayExpression([t.StringLiteral(source)]),
                );
                const webpackObj = t.objectProperty(
                  t.identifier('webpack'),
                  t.arrayExpression([
                    t.callExpression(
                      t.memberExpression(
                        t.identifier('require'),
                        t.identifier('resolveWeak'),
                      ),
                      [callPaths[0].get('arguments')[0].node],
                    ),
                  ]),
                );

                obj.parentPath.pushContainer('properties', moduleObj);
                obj.parentPath.pushContainer('properties', webpackObj);
              } catch (ex) {
                // eslint-disable-next-line
                console.log(ex);
              }
            },
          });
        },
      },
    },
  };
};
