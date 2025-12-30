require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./model/persons')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', (req) => (req.method === 'POST' ? JSON.stringify(req.body) : ''))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    'id': '1',
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': '2',
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': '3',
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': '4',
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => res.send(`<div><p>Phonebook has info for ${persons.length} people.</p><p>${Date()}</p></div>`))
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => res.json(person))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if(!body.name || !body.number){
    return res.status(400).json('Please send appropriate request!')
  }

  let name = body.name
  let found = persons.findIndex(person => person.name === name)
  if(found >= 0){
    return res.status(400).json('Person already exists')
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => res.json(savedPerson)).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})