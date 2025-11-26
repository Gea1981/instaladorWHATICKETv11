import { getHours } from "date-fns";

const _htmlEscape = (string: string) =>
    string
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

const _htmlUnescape = (htmlString: string) =>
    htmlString
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&#0?39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");

export function htmlEscape(strings: any, ...values: any[]) {
    if (typeof strings === "string") {
        return _htmlEscape(strings);
    }

    let output = strings[0];
    for (const [index, value] of values.entries()) {
        output = output + _htmlEscape(String(value)) + strings[index + 1];
    }

    return output;
}

export function htmlUnescape(strings: any, ...values: any[]) {
    if (typeof strings === "string") {
        return _htmlUnescape(strings);
    }

    let output = strings[0];
    for (const [index, value] of values.entries()) {
        output = output + _htmlUnescape(String(value)) + strings[index + 1];
    }

    return output;
}

export class MissingValueError extends Error {
    key: any;

    constructor(key: string) {
        super(
            `Missing a value for ${key ? `the placeholder: ${key}` : "a placeholder"}`
        );
        this.name = "MissingValueError";
        this.key = key;
    }
}

export const pupa = function pupa(
    template: string,
    data: any,
    { ignoreMissing = true, transform = ({ value }: any) => value } = {}
) {
    if (typeof template !== "string") {
        throw new TypeError(
            `Expected a \`string\` in the first argument, got \`${typeof template}\``
        );
    }

    if (typeof data !== "object") {
        throw new TypeError(
            `Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\``
        );
    }

    const hours = getHours(new Date());
    const getGreeting = () => {
        if (hours >= 6 && hours <= 11) {
            return "Buenos días!";
        }
        if (hours > 11 && hours <= 17) {
            return "Buenas Tardes!";
        }
        if (hours > 17 && hours <= 23) {
            return "Buenas Noches!";
        }
        return "Hola!";
    };

    data = { ...data, greeting: getGreeting() };

    const replace = (placeholder: string, key: string) => {
        let value = data;
        for (const property of key.split(".")) {
            value = value ? value[property] : undefined;
        }

        const transformedValue = transform({ value, key });
        if (transformedValue === undefined) {
            if (ignoreMissing) {
                return "";
            }

            throw new MissingValueError(key);
        }

        return String(transformedValue);
    };

    const composeHtmlEscape =
        (replacer: any) =>
            (...args: any) =>
                htmlEscape(replacer(...args));

    const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;

    if (doubleBraceRegex.test(template)) {
        template = template.replace(doubleBraceRegex, composeHtmlEscape(replace));
    }

    const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

    return template.replace(braceRegex, replace);
};
