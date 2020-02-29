function renderAttributes(attributes, level) {
  if (attributes.length === 0) return '';
  const indentation = '\t'.repeat(level + 1);
  const closingIndentation = '\t'.repeat(level);
  let string = '';
  for (const attribute of attributes) {
    const { key, value } = attribute;
    if (value) {
      string += `\n${indentation}${key}="${value}"`;
    } else {
      string += `\n${indentation}${key}`;
    }
  }
  string += `\n${closingIndentation}`;
  return string;
}

function reconstruct(children, level = 0) {
  let string = '';
  const indentation = '\t'.repeat(level);
  for (const child of children) {
    switch(child.type) {
      case 'comment':
        string += `\n${indentation}${child.value.replace(/\n/g, `\n${indentation}`)}`;
        break;
      case 'tag':
        string += `\n${indentation}<${child.name}${renderAttributes(child.attributes, level)}>`;
        string += reconstruct(child.children, level + 1);
        string += `\n${indentation}</${child.name}>`;
        break;
      case 'self-closing-tag':
        // Treat the !doctype tag differently
        if (child.name.toLowerCase() === '!doctype') {
          string += `<${child.name} ${child.attributes[0].key}>`;
        } else {
          string += `\n${indentation}<${child.name}${renderAttributes(child.attributes, level)}/>`;
        }
        break;
      case 'string':
        string += `\n${indentation}${child.value}`;
        break;
      default:
        throw new Error('Unrecognised child type');
    }
  }
  return string;
}

function reconstructFromContent(tree) {
  console.log(tree);
  const reconstruction = reconstruct(tree.children);
  return reconstruction;
}

async function reconstructFromFile(file) {
  const content = await fs.readFile(file, 'utf8');
  return reconstructFromContent(content);
}

module.exports = {
  reconstructFromContent,
  reconstructFromFile
};
