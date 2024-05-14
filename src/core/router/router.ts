import {
  type Router,
  type Result,
  type ParamIndexMap,
  METHOD_NAME_ALL,
  UnsupportedPathError,
  MESSAGE_MATCHER_IS_ALREADY_BUILT,
} from "./base";
import { checkOptionalParameter } from "../../utils/url";
import { PATH_ERROR, type ParamAssocArray } from "./node";
import { Trie } from "./trie";

type HandlerData<T> = [T, ParamIndexMap][];
type StaticMap<T> = Record<string, Result<T>>;
type Matcher<T> = [RegExp, HandlerData<T>[], StaticMap<T>];
type HandlerWithMetadata<T> = [T, number]; // [handler, paramCount]

const emptyParam: string[] = [];
const nullMatcher: Matcher<any> = [/^$/, [], Object.create(null)];

let wildcardRegExpCache: Record<string, RegExp> = Object.create(null);
function buildWildcardRegExp(path: string): RegExp {
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  return (wildcardRegExpCache[path] ??= new RegExp(
    path === "*"
      ? ""
      : `^${path.replace(/\/\*$|([.\\+*[^\]$()])/g, (_, metaChar) =>
          metaChar ? `\\${metaChar}` : "(?:|/.*)"
        )}$`
  ));
}

function clearWildcardRegExpCache() {
  wildcardRegExpCache = Object.create(null);
}

function buildMatcherFromPreprocessedRoutes<T>(
  routes: [string, HandlerWithMetadata<T>[]][]
): Matcher<T> {
  const trie = new Trie();
  const handlerData: HandlerData<T>[] = [];
  if (routes.length === 0) {
    return nullMatcher;
  }

  const routesWithStaticPathFlag = routes
    .map(
      (route) =>
        [!/\*|\/:/.test(route[0]), ...route] as [
          boolean,
          string,
          HandlerWithMetadata<T>[]
        ]
    )
    .sort(([isStaticA, pathA], [isStaticB, pathB]) =>
      isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
    );

  const staticMap: StaticMap<T> = Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [
        handlers.map(([h]) => [h, Object.create(null)]),
        emptyParam,
      ];
    } else {
      j++;
    }

    let paramAssoc: ParamAssocArray;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }

    if (pathErrorCheckOnly) {
      continue;
    }

    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap: ParamIndexMap = Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }

  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len = handlerData[i].length; j < len; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len = keys.length; k < len; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }

  const handlerMap: HandlerData<T>[] = [];
  // using `in` because indexReplacementMap is a sparse array
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }

  return [regexp, handlerMap, staticMap] as Matcher<T>;
}

function findMiddleware<T>(
  middleware: Record<string, T[]> | undefined,
  path: string
): T[] | undefined {
  if (!middleware) {
    return undefined;
  }

  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }

  return undefined;
}

export class RegExpRouter<T> implements Router<T> {
  name = "RegExpRouter";
  middleware?: Record<string, Record<string, HandlerWithMetadata<T>[]>>;
  routes?: Record<string, Record<string, HandlerWithMetadata<T>[]>>;

  constructor() {
    this.middleware = { [METHOD_NAME_ALL]: Object.create(null) };
    this.routes = { [METHOD_NAME_ALL]: Object.create(null) };
  }

  add(method: string, path: string, handler: T) {
    let currentPath = path;

    const { middleware, routes } = this;

    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }

    if (!middleware[method]) {
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = Object.create(null);
        for (const p of Object.keys(handlerMap[METHOD_NAME_ALL])) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        }
      }
    }

    if (currentPath === "/*") {
      currentPath = "*";
    }

    const paramCount = (currentPath.match(/\/:/g) || []).length;

    if (/\*$/.test(currentPath)) {
      const re = buildWildcardRegExp(currentPath);
      if (method === METHOD_NAME_ALL) {
        for (const m of Object.keys(middleware)) {
          middleware[m][currentPath] ||=
            findMiddleware(middleware[m], currentPath) ||
            findMiddleware(middleware[METHOD_NAME_ALL], currentPath) ||
            [];
        }
      } else {
        middleware[method][currentPath] ||=
          findMiddleware(middleware[method], currentPath) ||
          findMiddleware(middleware[METHOD_NAME_ALL], currentPath) ||
          [];
      }
      for (const m of Object.keys(middleware)) {
        if (method === METHOD_NAME_ALL || method === m) {
          for (const p of Object.keys(middleware[m])) {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          }
        }
      }

      for (const m of Object.keys(routes)) {
        if (method === METHOD_NAME_ALL || method === m) {
          for (const p of Object.keys(routes[m])) {
            re.test(p) && routes[m][p].push([handler, paramCount]);
          }
        }
      }

      return;
    }

    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path = paths[i];

      for (const m of Object.keys(routes)) {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path] ||= [
            ...(findMiddleware(middleware[m], path) ||
              findMiddleware(middleware[METHOD_NAME_ALL], path) ||
              []),
          ];
          routes[m][path].push([handler, paramCount - len + i + 1]);
        }
      }
    }
  }

  match(method: string, path: string): Result<T> {
    clearWildcardRegExpCache(); // no longer used.

    const matchers = this.buildAllMatchers();

    this.match = (method, path) => {
      const matcher = (matchers[method] ||
        matchers[METHOD_NAME_ALL]) as Matcher<T>;

      const staticMatch = matcher[2][path];
      if (staticMatch) {
        return staticMatch;
      }

      const match = path.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }

      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };

    return this.match(method, path);
  }

  private buildAllMatchers(): Record<string, Matcher<T> | null> {
    const matchers: Record<string, Matcher<T> | null> = Object.create(null);

    for (const method of [
      ...Object.keys(this.routes!),
      ...Object.keys(this.middleware!),
    ]) {
      matchers[method] ||= this.buildMatcher(method);
    }

    // Release cache
    this.middleware = this.routes = undefined;

    return matchers;
  }

  private buildMatcher(method: string): Matcher<T> | null {
    const routes: [string, HandlerWithMetadata<T>[]][] = [];

    let hasOwnRoute = method === METHOD_NAME_ALL;
    for (const r of [this.middleware!, this.routes!]) {
      const ownRoute = r[method]
        ? Object.keys(r[method]).map((path) => [path, r[method][path]])
        : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...(ownRoute as [string, HandlerWithMetadata<T>[]][]));
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...(Object.keys(r[METHOD_NAME_ALL]).map((path) => [
            path,
            r[METHOD_NAME_ALL][path],
          ]) as [string, HandlerWithMetadata<T>[]][])
        );
      }
    }

    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}
