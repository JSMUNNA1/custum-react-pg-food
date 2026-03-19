# 🚀 Custom React Fiber-Based Renderer

A lightweight implementation of a **React-like rendering engine** built from scratch, featuring a custom **Fiber architecture**, **non-blocking diffing algorithm**, and **incremental rendering**.

This project was created to deeply understand how modern UI libraries handle **reconciliation, scheduling, and efficient DOM updates**.

---

# 🧠 What This Project Demonstrates

This project replicates core concepts behind modern UI frameworks:

* Virtual DOM creation
* Diffing (Reconciliation)
* Fiber architecture (Linked list tree)
* Incremental rendering (Time slicing)
* Non-blocking UI updates
* Separation of Render & Commit phases

---

# ⚡ Key Features

### ✅ Custom Virtual DOM

* `createElement()` builds a tree representation of UI
* Supports nested elements and text nodes

---

### ✅ Fiber-Based Reconciliation

* Converts tree into a **linked list (Fiber structure)**
* Each node stores:

  * type
  * props
  * DOM reference
  * parent/child/sibling pointers
  * alternate (previous fiber)

---

### ✅ Non-Blocking Rendering

* Uses `requestIdleCallback` to:

  * Break rendering into small tasks
  * Prevent UI freezing
  * Keep browser responsive

---

### ✅ Incremental Work Loop

```js
while (nextUnitOfWork && !shouldYield) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
```

* Processes one unit at a time
* Pauses when browser needs control
* Resumes later

---

### ✅ Efficient Diffing (Reconciliation)

Handles:

* Node creation → `PLACEMENT`
* Node updates → `UPDATE`
* Node removal → `DELETION`

---

### ✅ Two-Phase Rendering Model

#### 1. Render Phase (Interruptible)

* Builds Fiber tree
* Calculates changes
* Can pause/resume

#### 2. Commit Phase (Synchronous)

* Applies changes to DOM
* Fast execution
* No interruption

---

### ✅ DOM Updates Optimization

* Reuses existing DOM nodes when possible
* Updates only changed properties
* Avoids full re-render

---

# 🏗️ Architecture Overview

```
Virtual DOM
     ↓
Fiber Tree (Linked List)
     ↓
Work Loop (Incremental Processing)
     ↓
Effect Tags (PLACEMENT / UPDATE / DELETION)
     ↓
Commit Phase (DOM Updates)
```

---

# 🔄 Core Workflow

1. Call `render()`
2. Create Work-In-Progress root (`wipRoot`)
3. Start `workLoop`
4. Process fibers using `performUnitOfWork`
5. Reconcile children (`reconcileChildren`)
6. Store changes using effect tags
7. Apply changes in `commitRoot`

---

# 📂 Important Functions

### `render(element, container)`

Initializes rendering and creates root fiber.

---

### `workLoop(deadline)`

Schedules and processes rendering tasks without blocking UI.

---

### `performUnitOfWork(fiber)`

* Creates DOM nodes
* Processes children
* Returns next fiber to work on

---

### `reconcileChildren(fiber, elements)`

* Compares old and new fibers
* Marks changes (placement/update/deletion)

---

### `commitRoot()`

* Applies all changes to DOM
* Updates current tree

---

### `commitWork(fiber)`

Handles actual DOM operations:

* Append
* Update
* Remove

---

# ⚠️ Limitations

This is a learning-focused implementation and does NOT include:

* Keys-based reconciliation
* Priority scheduling (lanes)
* Hooks system (useState, useEffect)
* Suspense / Concurrent features
* Error boundaries
* Advanced diff optimizations

---

# 🎯 Learning Outcomes

By building this project, you will understand:

* Why naive diffing blocks the UI
* How Fiber enables interruptible rendering
* How modern frameworks handle performance
* Difference between recursive vs iterative rendering
* Importance of scheduling in UI systems

---

# 🔥 Why This Matters

Traditional rendering:

```
Render everything → UI freezes ❌
```

Fiber-based rendering:

```
Render in chunks → UI stays responsive ✅
```

---

# 🚀 Future Improvements

* Add support for keys (better list diffing)
* Implement priority scheduling (lanes)
* Add hooks system (useState, useEffect)
* Implement batching
* Add concurrent rendering features

---

# 👨‍💻 Author

**Munna Thakur**
Frontend Developer passionate about understanding systems at a deeper level.

---

# ⭐ Final Thought

This project is not just about building a framework—
it’s about understanding **how modern UI systems think**.

> “The code is small, but the mental model is powerful.”
