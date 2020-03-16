const express = require('express');
const router = express.Router();

const db = require('../data/dbConfig.js');

router.get('/', (req, res) => {
    let limit = 100;
    if (req.query.limit) {
        limit = req.query.limit;
    }
    let sortby = 'id';
    if (req.query.sortby) {
        sortby = req.query.sortby;
    }
    let sortdir = 'asc';
    if (req.query.sortdir) {
        sortdir = req.query.sortdir;
    }

    db('accounts').limit(limit).orderBy(sortby, sortdir)
        .then(response => {
            console.log(response);
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: "There was an error while retrieving the accounts"});
        });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db('accounts').where({id: id}).first()
        .then(response => {
            console.log(response);
            if (response !== undefined) {
                res.status(200).json(response);
            } else {
                res.status(500).json({message: `There was an error while retrieving the account with id ${id}`})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: `There was an error while retrieving the account with id ${id}`});
        });
});

router.post('/', validateBody(['name', 'budget']), (req, res) => {
    const payload = {
        name: req.body.name,
        budget: req.body.budget
    };
    db('accounts').insert(payload)
        .then(response => {
            console.log(response);
            db('accounts').where({id :response[0]}).first()
                .then(newResponse => {
                    res.status(201).json(newResponse);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({error: err, message: `There was an error while retrieving the new account, which has the id of ${id}`});
                });  
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: "Unable to insert new account."});
        });
});

router.put('/:id', validateId, validateBody(['name', 'budget']), (req, res) => {
    const payload = {
        name: req.body.name,
        budget: req.body.budget
    };
    db('accounts').where({id: req.params.id}).update(payload)
        .then(response => {
            console.log(response);
            if (response !== 1) {
                res.status(500).json({message: `Unable to update account of id ${req.params.id}`});
            } else {
                db('accounts').where({id :req.params.id}).first()
                .then(newResponse => {
                    res.status(201).json(newResponse);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({error: err, message: `There was an error while retrieving the new account, which has the id of ${req.params.id}`});
                });  
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: `Unable to update account of id ${req.params.id}`});
        });
});

router.delete('/:id', validateId, (req, res) => {
    const id = req.params.id;
    db('accounts').where({id : id}).del()
        .then(response => {
            console.log(response);
            if (response === 1) {
                db('accounts')
                .then(response => {
                    console.log(response);
                    res.status(200).json(response);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({error: err, message: "There was an error while retrieving the accounts"});
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: `There was an error while deleting the account of id {id}`});
        });
});

function validateId(req, res, next) {
    const id = req.params.id;
    db('accounts').where({id: id}).first()
        .then(response => {
            if (response !== undefined) {
            next();
            } else {
                res.status(500).json({message: `Unable to retrieve account of id ${id}`});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err, message: `Unable to retrieve account of id ${id}`});
        });
}; 

function validateBody(fields) {
    return function(req, res, next) {
        for (let i=0; i<fields.length; i++) {
            let field = fields[i];
            if (!req.body[field]) {
                res.status(400).json({message: `Account is missing ${field}`})
            }
        }
        next();
    };
};

module.exports = router;