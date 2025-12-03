declare module 'prismjs' {
    export function highlight(code: string, grammar: any, language: string): string;
    export const languages: { [key: string]: any };
}
