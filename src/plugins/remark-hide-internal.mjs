// Em produção a página de débitos técnicos não existe; remove os links que apontam para ela.
const INTERNAL = /debitos-tecnicos/;

const isInternalLink = (node) => node.type === 'link' && INTERNAL.test(node.url ?? '');

const hasInternalLink = (node) =>
  isInternalLink(node) || (node.children ?? []).some(hasInternalLink);

const toText = (node) =>
  node.value ?? (node.children ?? []).map(toText).join('');

function walk(node) {
  if (!node.children) return;
  node.children = node.children.flatMap((child) => {
    // Item de lista cujo conteúdo é o link para a página interna: remove o item inteiro.
    if (child.type === 'listItem' && hasInternalLink(child) && toText(child).length < 200) {
      return [];
    }
    // Demais ocorrências: mantém só o texto do link.
    if (isInternalLink(child)) return child.children;
    walk(child);
    return [child];
  });
}

export default function remarkHideInternal() {
  return (tree) => walk(tree);
}
