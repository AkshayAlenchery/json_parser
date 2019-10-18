const nullParser = jsonInput => jsonInput.startsWith('null') ? [null, jsonInput.slice(4).trim()] : null
const booleanParser = jsonInput => jsonInput.startsWith('true') ? [true, jsonInput.slice(4).trim()] : (jsonInput.startsWith('false') ? [false, jsonInput.slice(5).trim()] : null)
const commaParser = jsonInput => jsonInput.startsWith(',') ? [',', jsonInput.slice(1).trim()] : null
const collonParser = jsonInput => jsonInput.startsWith(':') ? [':', jsonInput.slice(1).trim()] : null
const numberParser = (jsonInput, match = null) => (match = jsonInput.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)) === null ? null : [match[0] * 1, jsonInput.slice(match[0].length).trim()]

const stringParser = jsonInput => {
  if (!jsonInput.startsWith('"')) return null
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
    if (jsonInput.length === 0) return null
  }
  return [result, jsonInput.slice(1).trim()]
}

const arrayParser = jsonInput => {
  if (!jsonInput.startsWith('[')) return null
  const result = []
  jsonInput = jsonInput.slice(1).trim()
  while (jsonInput[0] !== ']' && jsonInput.length > 1) {
    const parsersedResult = valueParser(jsonInput)
    if (parsersedResult === null) return null
    result.push(parsersedResult[0])
    jsonInput = parsersedResult[1]
    const commaParsedResult = commaParser(jsonInput)
    if (commaParsedResult === null) break
    jsonInput = commaParsedResult[1]
  }
  if (jsonInput[0] === ']' && jsonInput.length >= 1) return [result, jsonInput.slice(1).trim()]
  return null
}

const objectParser = jsonInput => {
  if (!jsonInput.startsWith('{')) return null
  const result = {}
  let key = null
  let value = null
  jsonInput = jsonInput.slice(1).trim()
  while (jsonInput[0] !== '}' && jsonInput.length > 1) {
    let objectParserResult = stringParser(jsonInput)
    if (objectParserResult == null) return null
    key = objectParserResult[0]
    jsonInput = objectParserResult[1]
    if ((objectParserResult = collonParser(jsonInput)) == null) return null
    jsonInput = objectParserResult[1]
    const valueParserResult = valueParser(jsonInput)
    if (valueParserResult === null) return null
    value = valueParserResult[0]
    result[key] = value
    jsonInput = valueParserResult[1]
    const commaParserResult = commaParser(jsonInput)
    if (commaParserResult === null) break
    jsonInput = commaParserResult[1]
  }
  if (jsonInput[0] === '}' && jsonInput.length >= 1) return [result, jsonInput.slice(1).trim()]
  return null
}

const valueParser = jsonInput => {
  const parsers = [nullParser, booleanParser, numberParser, stringParser, arrayParser, objectParser]
  for (const parser of parsers) {
    const result = parser(jsonInput)
    if (result !== null) return result
  }
  return null
}

require('fs').readFile('test_cases/test.json', (err, data) => {
  if (err) throw err
  else (result = valueParser(data.toString().trim())) ? console.log(result[0]) : console.log('Invalid JSON')
})