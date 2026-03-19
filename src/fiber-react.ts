/**
 * A custom Fiber-based React implementation inspired by "Build your own React" (Didact).
 */

type Fiber = {
  type?: string | Function;
  props: {
    children: any[];
    [key: string]: any;
  };
  dom?: HTMLElement | Text;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber;
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  hooks?: any[];
};

function createElement(type: string | Function, props: any, ...children: any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.flat().map(child =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: any) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber: Fiber): HTMLElement | Text {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  updateDom(dom, { children: [] }, fiber.props);

  return dom;
}

const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);
const isNew = (prev: any, next: any) => (key: string) => prev[key] !== next[key];
const isGone = (prev: any, next: any) => (key: string) => !(key in next);

function updateDom(dom: HTMLElement | Text, prevProps: any, nextProps: any) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(key => isNew(prevProps, nextProps)(key))
    .forEach(name => {
      (dom as any)[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(fiber => {
    let domParentFiber = fiber.parent;
    while (!domParentFiber?.dom) {
      domParentFiber = domParentFiber?.parent;
    }
    const domParent = domParentFiber.dom;
    commitDeletion(fiber, domParent);
  });
  commitWork(wipRoot?.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
  if (fiber.dom) {
    if (domParent.contains(fiber.dom)) {
      domParent.removeChild(fiber.dom);
    }
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent);
    let sibling = fiber.child.sibling;
    while (sibling) {
      commitDeletion(sibling, domParent);
      sibling = sibling.sibling;
    }
  }
}

function render(element: any, container: HTMLElement) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot || undefined,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork: Fiber | null = null;
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] = [];

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber: Fiber | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

let wipFiber: Fiber | null = null;
let hookIndex: number = 0;

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const result = (fiber.type as Function)(fiber.props);
  const children = Array.isArray(result) ? result : [result];
  reconcileChildren(fiber, children.flat());
}

function useState<T>(initial: T): [T, (action: T | ((prev: T) => T)) => void] {
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [] as any[],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: any) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  const setState = (action: any) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot?.dom,
      props: currentRoot?.props!,
      alternate: currentRoot || undefined,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber?.hooks?.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber: Fiber, elements: any[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | undefined = undefined;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber: Fiber | undefined = undefined;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber!,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling!.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

export const MyReact = {
  createElement,
  render,
  useState,
};
