const currencyRE = /(?:R\$|r\$)?\s*(\d+[\.,]?\d*)/i

function parseAmount(text){
  const m = text.match(currencyRE)
  if(!m) return 0
  return Number(m[1].replace(',', '.'))
}

const expenseCategories = ['Alimentação', 'Transporte', 'Contas Fixas', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Outros']
const investmentAssets = ['Tesouro', 'SELIC', 'Poupança', 'CDB', 'LCI', 'LCA', 'FII', 'Ações', 'Dólar', 'Outros investimentos']

function matchExpenseCategory(lower){
  const patterns = [
    { category: 'Alimentação', words: ['ifood', 'mercado', 'supermercado', 'restaurante', 'padaria', 'comida', 'alimentação', 'alimentacao', 'almoço', 'almoco', 'jantar', 'merenda', 'pizza', 'lanche', 'hamburguer'] },
    { category: 'Transporte', words: ['uber', 'taxi', 'táxi', 'gasolina', 'posto', 'transporte', 'ônibus', 'onibus', 'metrô', 'metro', 'trem', 'passagem'] },
    { category: 'Contas Fixas', words: ['luz', 'internet', 'água', 'agua', 'telefone', 'conta', 'contas', 'aluguel', 'energia', 'gás', 'gas', 'boleto'] },
    { category: 'Lazer', words: ['cinema', 'bar', 'viagem', 'show', 'entretenimento', 'lazer', 'festa', 'passeio'] },
    { category: 'Saúde', words: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico', 'saúde', 'saude', 'hospital', 'exame', 'dentista'] },
    { category: 'Educação', words: ['curso', 'faculdade', 'cursinho', 'livro', 'educação', 'educacao', 'escola', 'aula'] },
    { category: 'Compras', words: ['roupa', 'roupas', 'calçado', 'calcado', 'eletrônico', 'eletronico', 'celular', 'notebook', 'compra', 'compras', 'shopping', 'presente'] },
  ]

  function hasWord(text, word) {
    const regex = new RegExp(`(^|[^a-zA-ZÀ-ÿ0-9])${word}([^a-zA-ZÀ-ÿ0-9]|$)`, 'i')
    return regex.test(text)
  }

  const matchedCategories = []
  patterns.forEach(p => {
    if (p.words.some(w => hasWord(lower, w))) {
      matchedCategories.push(p.category)
    }
  })

  if(matchedCategories.length === 1) return { type: 'category', category: matchedCategories[0], confidence: 'exact' }
  if(matchedCategories.length > 1) return { type: 'ambiguous', candidates: matchedCategories }

  const weak = expenseCategories.filter(cat => cat !== 'Outros').filter(cat => hasWord(lower, cat.toLowerCase().split(' ')[0]))
  if(weak.length === 1) return { type: 'ambiguous', candidates: weak }
  if(weak.length > 1) return { type: 'ambiguous', candidates: weak }

  return { type: 'ambiguous', candidates: expenseCategories }
}

function matchInvestmentAsset(lower){
  const patterns = [
    { asset: 'Tesouro', words: ['tesouro'] },
    { asset: 'SELIC', words: ['selic'] },
    { asset: 'Poupança', words: ['poupança', 'poupanca'] },
    { asset: 'CDB', words: ['cdb'] },
    { asset: 'LCI', words: ['lci'] },
    { asset: 'LCA', words: ['lca'] },
    { asset: 'FII', words: ['fii', 'fiis'] },
    { asset: 'Ações', words: ['ações', 'acoes', 'ação', 'acao'] },
    { asset: 'Dólar', words: ['dólar', 'dolar', 'dólares', 'dolares', 'usd'] },
  ]

  function hasWord(text, word) {
    const regex = new RegExp(`(^|[^a-zA-ZÀ-ÿ0-9])${word}([^a-zA-ZÀ-ÿ0-9]|$)`, 'i')
    return regex.test(text)
  }

  const matchedAssets = []
  patterns.forEach(p => {
    if (p.words.some(w => hasWord(lower, w))) {
      matchedAssets.push(p.asset)
    }
  })

  if(matchedAssets.length === 1) return { type: 'asset', asset: matchedAssets[0], confidence: 'exact' }
  if(matchedAssets.length > 1) return { type: 'ambiguous', candidates: matchedAssets }

  return { type: 'ambiguous', candidates: investmentAssets }
}

function getInvestmentIntent(lower){
  return /estou pensando|estava pensando|penso em|pretendo|quero investir|vale a pena|será que|talvez/i.test(lower)
}

function findGoalDepositTarget(lower, goals){
  if(!Array.isArray(goals) || !goals.length) return { type: 'saldo' }

  const exact = goals.filter(g => lower.includes(g.name.toLowerCase()))
  if(exact.length === 1) return { type: 'goal', goal: exact[0].name, confidence: 'exact' }
  if(exact.length > 1) return { type: 'ambiguous', candidates: exact.map(g => g.name) }

  const candidates = goals
    .map(g => {
      const goalWords = g.name.toLowerCase().split(/\s+/).filter(Boolean)
      const matched = goalWords.filter(word => lower.includes(word))
      return { name: g.name, score: matched.length }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  if(!candidates.length) return { type: 'saldo' }
  if(candidates.length === 1) return { type: 'ambiguous', candidates: [candidates[0].name] }

  if(candidates[0].score > candidates[1].score) return { type: 'ambiguous', candidates: [candidates[0].name] }

  return { type: 'ambiguous', candidates: candidates.slice(0, 3).map(c => c.name) }
}

export function parseMessage(text, data){
  const lower = text.toLowerCase()
  let reply = ''

  // Deposits / ganhos
  if(/depositei|guardei|recebi|sal(á|a)rio|receb(i|e)|coloquei/i.test(lower)){
    const amount = parseAmount(text)
    const target = findGoalDepositTarget(lower, data?.goals)
    if(target.type === 'goal'){
      reply = `Depósito de ${amount} na meta ${target.goal} registrado.`
      return { action: 'deposit_goal', amount, goal: target.goal, text, reply }
    }
    if(target.type === 'ambiguous'){
      const candidates = target.candidates || []
      const candidateLabel = candidates.length ? candidates.join(' ou ') : 'uma meta'
      reply = `Você quer depositar ${amount} na meta ${candidateLabel} ou no saldo?`
      return { action: 'clarify', kind: 'deposit', amount, candidates, text, reply }
    }
    // Se houver metas existentes, pedimos confirmação em vez de alocar automaticamente no saldo.
    if(Array.isArray(data?.goals) && data.goals.length){
      reply = `Você quer depositar ${amount} no saldo ou em alguma meta?`
      return { action: 'clarify', kind: 'deposit', amount, candidates: data.goals.map(g => g.name), text, reply }
    }
    reply = `Depósito de ${amount} registrado.`
    return { action: 'deposit', amount, text, reply }
  }

  // Saque de metas
  if(/retirei|saquei|tirei/i.test(lower) && /meta|reserva|poupança|reserva de emergencia|reserva de emergência/i.test(lower)){
    const amount = parseAmount(text)
    const target = findGoalDepositTarget(lower, data?.goals)
    if(target.type === 'goal'){
      reply = `Saque de ${amount} da meta ${target.goal} realizado.`
      return { action: 'withdraw_goal', amount, goal: target.goal, text, reply }
    }
    reply = `Você quer sacar ${amount} de qual meta?`
    return { action: 'clarify', kind: 'withdraw_goal', amount, candidates: (data?.goals||[]).map(g => g.name), text, reply }
  }

  // Enciclopédia / explicações (modo Warren Buffett)
  // Se a mensagem é uma pergunta ou menciona um ativo sem verbo de ação, responde em modo enciclopédia
  if(/\b(o que é|como funciona|me explique|\?)\b/i.test(lower) || (/(tesouro|selic|poupança|cdb|lci|lca|fii|ações|dólar|dolar|juros compostos|inflação)/i.test(lower) && !/(investi|investir|aporte|comprei|gastei|paguei|pago|saquei|retirei)/i.test(lower))){
    const topicMatch = /(tesouro|selic|poupança|cdb|lci|lca|fii|ações|dólar|dolar|diversificaçã|diversificar|juros compostos|inflação|renda fixa|renda variável)/i.exec(lower)
    const topic = topicMatch ? topicMatch[0].toLowerCase() : null

    const explanations = {
      'tesouro': 'Tesouro Direto: títulos públicos são empréstimos ao governo. São opções de baixo risco relativo e úteis para reserva de emergência ou objetivos de médio prazo. Prefira títulos atrelados à inflação para proteger seu poder de compra.',
      'selic': 'SELIC: é a taxa básica de juros do país. Afeta rendimentos de renda fixa e o custo de crédito. Quando a Selic sobe, renda fixa costuma render mais; quando cai, renda variável pode se valorizar.',
      'poupança': 'Poupança: produto simples e líquido, mas historicamente com rendimento baixo após impostos e inflação. Útil apenas por simplicidade; para objetivos financeiros, há alternativas melhores.',
      'cdb': 'CDB: um título emitido por bancos. Pode pagar taxa fixa ou atrelada a % do CDI. Verifique a solidez do emissor e liquidez antes de aplicar.',
      'lci': 'LCI/LCA: títulos isentos de IR emitidos por bancos, geralmente para financiar setor imobiliário ou crédito agrícola. Boa opção para quem busca renda fixa e isenção fiscal, respeite prazos de carência.',
      'fii': 'FII (Fundos Imobiliários): permitem investir em imóveis de forma fracionada e receber rendimentos. Ideal para renda passiva, mas sujeita à variação de mercado e vacância.',
      'ações': 'Ações: representam participação em empresas. Podem trazer ganhos maiores no longo prazo, mas são voláteis. Invista em empresas que você entende e mantenha horizonte longo.',
      'dólar': 'Dólar: moeda forte e ativo de proteção (hedge). Ajuda a proteger o patrimônio contra crises locais, mas não gera juros compostos por si só como ações ou renda fixa.',
      'dolar': 'Dólar: moeda forte e ativo de proteção (hedge). Ajuda a proteger o patrimônio contra crises locais, mas não gera juros compostos por si só como ações ou renda fixa.',
      'diversificaçã': 'Diversificação: distribuir investimentos reduz risco específico. Não coloque tudo em um único ativo nem em algo que você não entende.',
      'juros compostos': 'Juros compostos: é o efeito de ganhar juros sobre juros ao longo do tempo. Começar cedo e reinvestir rendimentos é um dos maiores aliados do investidor.',
      'inflação': 'Inflação: erosão do poder de compra. Proteja-se com ativos que acompanhem ou superem a inflação no longo prazo.',
      'renda fixa': 'Renda fixa: ativos com promessa de pagamento de juros (ex.: títulos públicos, CDB). Menor volatilidade que ações, bom para reserva de emergência e objetivos definidos.',
      'renda variável': 'Renda variável: inclui ações e fundos, com maior volatilidade e potencial de retorno no longo prazo. Requer tolerância a oscilações.'
    }

    // Resposta aprimorada: título, resumo, exemplos, riscos e passos práticos
    const key = topic ? Object.keys(explanations).find(k=>topic.indexOf(k) !== -1) : null
    // Construir resposta curta e detalhes separados
    let short = ''
    let details = ''
    if(key){
      if(key === 'tesouro'){
        short = `Tesouro Direto — ${explanations[key].split('.').slice(0,1).join('.')}.`
        details = `Tipos comuns:\n- Tesouro Selic: alta liquidez, indicado para reserva de emergência.\n- Tesouro IPCA+: protege contra a inflação, indicado para objetivos de médio/longo prazo.\n- Tesouro Prefixado: pode ser vantajoso quando as taxas estão altas, mas envolve risco de mercado se precisar resgatar antes.\n\nRiscos/atenção:\n- Risco de mercado ao vender antes do vencimento; prefira manter até o prazo se possível.\n- Considere impostos e taxas da corretora.\n\nSugestão prática:\n1) Defina horizonte e objetivo. 2) Use Tesouro Selic para liquidez; Tesouro IPCA+ para proteção da inflação. 3) Comece com valores pequenos e acompanhe.`
      } else if(key === 'cdb'){
        short = `CDB — ${explanations[key].split('.').slice(0,1).join('.')}.`
        details = `O que observar:\n- Rentabilidade: taxa fixa ou % do CDI. Compare propostas entre bancos.\n- Liquidez: verifique se há carência (resgate somente no vencimento).\n- Garantia: valores até R$250.000 por CPF por instituição são cobertos pelo FGC.\n\nRiscos/atenção:\n- Risco do emissor (bancos menores pagam mais por risco).\n- Tributação regressiva de IR conforme prazo.\n\nSugestão prática:\n1) Prefira CDBs de bancos sólidos ou com garantia do FGC. 2) Compare % do CDI e prazos. 3) Avalie liquidez antes de aplicar.`
      } else {
        short = `${key.replace(/\w/,c=>c.toUpperCase())} — ${explanations[key].split('.').slice(0,1).join('.')}.`
        details = `Detalhes:\n${explanations[key]}\n\nDica prática: comece pequeno, entenda custos e prazo, e mantenha um horizonte alinhado ao seu objetivo.`
      }
    } else {
      short = `Explicação financeira — princípios práticos.`
      details = `- Não invista no que não entende.\n- Priorize reserva de emergência (3–6 meses de despesas).\n- Diversifique entre renda fixa e variável conforme seu horizonte.\n- Atente-se a taxas, impostos e liquidez.\n\nSe quiser, pergunte por um termo específico: \"o que é tesouro?\", \"o que é CDB?\", \"como funcionam juros compostos?\".`
    }
    return { action: 'explain', reply: short, details }
  }

  // Investimentos (exige verbo de ação)
  if(/investi|investir|aporte|aportei/i.test(lower)){
    const amount = parseAmount(text)
    const assetMatch = matchInvestmentAsset(lower)

    if(amount <= 0){
      if(assetMatch.type === 'asset'){
        const asset = assetMatch.asset
        if(asset.toLowerCase() === 'poupança'){
          reply = `Poupança é simples e segura para guardar dinheiro, mas costuma render pouco. Você quer só minha opinião ou deseja registrar um investimento? Se quiser registrar, me diga o valor.`
          return { action: 'clarify', kind: 'invest_plan', candidates: ['Opinião sobre a poupança', 'Registrar investimento'], asset, text, reply }
        }
        reply = `Você quer investir em ${asset} ou só quer uma opinião? Se for registrar, me diga o valor.`
        return { action: 'clarify', kind: 'invest_plan', candidates: ['Opinião', 'Registrar investimento'], asset, text, reply }
      }
      reply = `Você quer só uma opinião sobre o investimento ou deseja registrar um aporte? Se for registrar, me diga o valor e o ativo.`
      return { action: 'clarify', kind: 'invest_plan', candidates: ['Opinião', 'Registrar investimento'], text, reply }
    }

    if(assetMatch.type === 'asset'){
      const asset = assetMatch.asset
      reply = `Registro de investimento ${asset} de ${amount}.`
      return { action: 'invest', amount, asset, text, reply }
    }
    reply = `Você quer investir ${amount} em qual ativo?`
    return { action: 'clarify', kind: 'invest', amount, candidates: assetMatch.candidates || investmentAssets, text, reply }
  }

  // Despesas
  if(/gastei|paguei|comprei|paguei|pago/i.test(lower)){
    const amount = parseAmount(text)
    const categoryMatch = matchExpenseCategory(lower)
    if(categoryMatch.type === 'category'){
      const category = categoryMatch.category
      reply = `Despesa de ${amount} em ${category} registrada.`
      return { action: 'expense', amount, category, text, reply }
    }
    reply = `Você quer classificar a despesa de ${amount} em qual categoria?`
    return { action: 'clarify', kind: 'expense', amount, candidates: categoryMatch.candidates || expenseCategories, text, reply }
  }

  // fallback
  reply = `Não entendi totalmente. Diga por exemplo: "gastei 50 no mercado" ou "investi 200 em tesouro".`
  return { action: null, reply }
}
