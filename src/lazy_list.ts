const template = document.createElement("template");
template.innerHTML = `
<style>
#list {
  height: var(--height);
  width: var(--width);  
  border: var(--border);
  padding: var(--padding);
  overflow: scroll;
  scrollbar-width: none;
}
#spacer-top {
  width: 100%;
  height: 0px;
}
#spacer-bottom {
  width: 100%;
  height: 1000px;
}
</style>
<div id="list">
  <div id="spacer-top"></div>
  <slot></slot>
  <div id="spacer-bottom"></div>
</div>
`;

export type Renderer<T> = (item: T) => HTMLElement;

export class LazyList<T> extends HTMLElement {
  // By default, the list renders the items as div-s with strings in them.
  #renderFunction: Renderer<T> = (item) => {
    const element = document.createElement("div");
    element.innerText = JSON.stringify(item);
    return element;
  };

  // These could be useful properties to consider, but not mandatory to use.
  // Similarly, feel free to edit the shadow DOM template in any way you want.

  // By default, the list is empty.
  #data: T[] = [];

  #itemHeight = 0;

  // The index of the first visible data item.
  #visiblePosition: number = 0;
  #visibleItemsCount: number = 4;

  #topOffsetElement: HTMLElement;
  #bottomOffsetElement: HTMLElement;

  // The container that stores the spacer elements and the slot where items are inserted.
  #listElement: HTMLElement;

  static register() {
    customElements.define("lazy-list", LazyList);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#topOffsetElement =
      this.shadowRoot.querySelector<HTMLElement>("#spacer-top")!;
    this.#bottomOffsetElement =
      this.shadowRoot.querySelector<HTMLElement>("#spacer-bottom")!;
    this.#listElement = this.shadowRoot.querySelector<HTMLElement>("#list")!;

    this.#listElement.onscroll = () => {
      this.#scrollPositionChanged(this.#listElement.scrollTop);
    };
  }

  setData(data: T[]) {
    this.#data = data;
    this.#contentChanged();
  }

  setRenderer(renderer: Renderer<T>) {
    this.#renderFunction = renderer;
    this.#contentChanged();
  }

  #contentChanged() {
    this.innerHTML = "";
    for (const item of this.#data.slice(
      this.#visiblePosition,
      this.#visiblePosition + this.#visibleItemsCount,
    )) {
      this.appendChild(this.#renderFunction(item));
    }
  }

  #scrollPositionChanged(topOffset: number) {
    this.#itemHeight = 365;
    const updatedVisiblePosition = Math.floor(topOffset / this.#itemHeight);
    if (updatedVisiblePosition === this.#visiblePosition) {
      return;
    }

    this.#visiblePosition = updatedVisiblePosition;
    const endIndex = Math.min(
      this.#data.length,
      this.#visiblePosition + this.#visibleItemsCount,
    );

    this.#topOffsetElement.style.height = `${this.#visiblePosition * this.#itemHeight}px`;
    this.#bottomOffsetElement.style.height = `${(this.#data.length - endIndex) * this.#itemHeight}px`;

    this.#contentChanged();
  }
}
