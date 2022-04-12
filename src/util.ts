function areEqualShallow(a: any, b: any) {
  for (var key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for (var key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
function allPropsEqual(a: any, b: any) {
  for (var key in a) {
    if ((key in b) && a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

function* times(x: any) {
  for (var i = 0; i < x; i++)
    yield i;
}

export function replacer(key: any, value: any) {
  if(value instanceof Map) {
    return Object.fromEntries(value.entries())
  } else {
    return value
  }
}

