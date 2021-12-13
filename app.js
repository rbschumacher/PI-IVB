const express = require('express')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const getClientsData = () => {
  const jsonData = fs.readFileSync('clients.json')
  return JSON.parse(jsonData)    
}

const saveClientData = data => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync('clients.json', stringifyData)
}

const validateRequestBody = data => {
  if (
    data.name &&
    data.birthdate && 
    data.phone_number &&
    data.address &&
    data.address.street &&
    data.address.number &&
    data.address.city &&
    data.address.cep &&
    data.address.state &&
    data.address.country
  ) return true

  return false
}

app.post('/clients/add', (req, res) => {
  const existClients = getClientsData()
  const clientData = req.body

  if (!validateRequestBody(clientData)) 
    return res.status(401).send({ error: true, msg: 'client data missing' })
    
  const findExist = existClients.find(client => client.name === clientData.name)
  if (findExist) 
    return res.status(409).send({ error: true, msg: 'this client has already been registered' })

  existClients.push({ id: uuidv4(), ...clientData })

  saveClientData(existClients);
  res.send({ success: true, msg: 'client registered successfully' })

})

app.get('/clients/list', (_, res) => {
  const clients = getClientsData()
  res.send(clients)
})

app.patch('/clients/update/:id', (req, res) => {
    const id = req.params.id
    const clientData = req.body

    const existClients = getClientsData()
    const clientToBeUpdated = existClients.find(client => client.id === id)

    if (!clientToBeUpdated) {
      return res.status(404).send({ error: true, msg: 'client not found' })
    }

    const filteredClients = existClients.filter(client => client.id !== id)

    filteredClients.push({ ...clientToBeUpdated, ...clientData })

    saveClientData(filteredClients)

    res.send({ success: true, msg: 'client data updated successfully' })
})

app.delete('/clients/delete/:id', (req, res) => {
  const id = req.params.id

  const existClients = getClientsData()

  const filteredClients = existClients.filter(client => client.id !== id)

  if (existClients.length === filteredClients.length) 
    return res.status(409).send({ error: true, msg: 'id does not exist' })

  saveClientData(filteredClients)

  res.send({ success: true, msg: 'client removed successfully' })
})

app.listen(3000, () => {
  console.log('Server runs on port 3000')
})