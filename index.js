const nullParser = jsonInput => jsonInput.startsWith('null') ? ['null', jsonInput.slice(4).trim()] : null
const booleanParser = jsonInput => jsonInput.startsWith('true') ? [true, jsonInput.slice(4).trim()] : (jsonInput.startsWith('false') ? [false, jsonInput.slice(5).trim()] : null)
const numberParser = jsonInput => {
  if (/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/.test(jsonInput)) {
    const match = jsonInput.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)
    return [match[0] * 1, jsonInput.slice(match[0].length).trim()]
  }
  return null
}
const stringParser = jsonInput => {
  if (jsonInput.startsWith('"')) {
    jsonInput = jsonInput.slice(1)
    let result = ''
    while (jsonInput[0] !== '"') {
      let end = 1
      if (jsonInput[0] === '\\') {
        const allowed = { '"': '\\"', '\\': '\\\\', '/': '\\/', 'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t' }
        if (jsonInput[1] in allowed) {
          result += allowed[jsonInput[1]]
          jsonInput = jsonInput.slice(2)
          continue
        }
        else if (jsonInput[1] === 'u' && /[a-fA-F0-9]{4}/.test(jsonInput.slice(2, 6))) end = 6
        else return null
      }
      result += jsonInput.slice(0, end)
      jsonInput = jsonInput.slice(end)
    }
    return [result, jsonInput.slice(1).trim()]
  } return null
}
const commaParser = jsonInput => jsonInput.startsWith(',') ? [',', jsonInput.slice(1).trim()] : null
const collonParser = jsonInput => jsonInput.startsWith(':') ? [':', jsonInput.slice(1).trim()] : null

const arrayParser = jsonInput => {
  const result = []
  if (jsonInput.startsWith('[')) {
    jsonInput = jsonInput.slice(1).trim()
    while (jsonInput[0] !== ']' && jsonInput.length > 1) {
      const parsersedResult = valueParser(jsonInput)
      if (parsersedResult == null) return null
      result.push(parsersedResult[0])
      jsonInput = parsersedResult[1]
      let commaResult
      if ((commaResult = commaParser(jsonInput)) == null) break
      jsonInput = commaResult[1]
    }
    if (jsonInput[0] === ']' && jsonInput.length >= 1) return [result, jsonInput.slice(1).trim()]
    else return null
  } return null
}
const objectParser = jsonInput => {
  const result = {}
  let key = null
  let value = null
  if (jsonInput.startsWith('{')) {
    jsonInput = jsonInput.slice(1).trim()
    while (jsonInput[0] !== '}' && jsonInput.length > 1) {
      let objectP = stringParser(jsonInput)
      if (objectP == null) return null
      key = objectP[0]
      jsonInput = objectP[1]
      if ((objectP = collonParser(jsonInput)) == null) return null
      jsonInput = objectP[1]
      const valueP = valueParser(jsonInput)
      if (valueP == null) return null
      value = valueP[0]
      result[key] = value
      jsonInput = valueP[1]
      const commaParse = commaParser(jsonInput)
      if (commaParse === null) break
      jsonInput = commaParse[1]
    }
    if (jsonInput[0] === '}' && jsonInput.length >= 1) return [result, jsonInput.slice(1).trim()]
    else return null
  } return null
}

const valueParser = jsonInput => {
  const parsers = [nullParser, booleanParser, numberParser, stringParser, arrayParser, objectParser]
  for (let parser of parsers) {
    const result = parser(jsonInput)
    if (result !== null)
      return result
  }
  return null
}

require('fs').readFile('test_cases/passReddit.json', (err, data) => {
  if (err) throw err
  const result = valueParser(data.toString().trim())
  console.log(result[0])
})