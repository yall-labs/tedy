export type Option<T> = {
	label: string;
	value: T;
};

type OptionMapItem<T> = Option<T> & {
	previous: OptionMapItem<T> | undefined;
	next: OptionMapItem<T> | undefined;
	index: number;
};

export default class OptionMap<T> extends Map<T, OptionMapItem<T>> {
	readonly first: OptionMapItem<T> | undefined;

	constructor(options: Option<T>[]) {
		const items: Array<[T, OptionMapItem<T>]> = [];
		let firstItem: OptionMapItem<T> | undefined;
		let previous: OptionMapItem<T> | undefined;
		let index = 0;

		for (const option of options) {
			const item = {
				...option,
				previous,
				next: undefined,
				index,
			};

			if (previous) {
				previous.next = item;
			}

			firstItem ||= item;

			items.push([option.value, item]);
			index++;
			previous = item;
		}

		super(items);
		this.first = firstItem;
	}
}
