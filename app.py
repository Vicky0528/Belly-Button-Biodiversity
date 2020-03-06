import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
# from gevent.pywsgi import WSGIServer

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data/belly_button.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Samples).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    # return jsonify(list(df.columns)[2:])
    return jsonify(list(df['id']))


@app.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    sel = [
        Samples_Metadata.id,
        Samples_Metadata.ethnicity,
        Samples_Metadata.gender,
        Samples_Metadata.age,
        Samples_Metadata.location,
        Samples_Metadata.bbtype,
        Samples_Metadata.wfreq,
    ]

    results = db.session.query(*sel).filter(Samples_Metadata.id == sample).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["id"] = result[0]
        sample_metadata["ethnicity"] = result[1]
        sample_metadata["gender"] = result[2]
        sample_metadata["age"] = result[3]
        sample_metadata["location"] = result[4]
        sample_metadata["bbtype"] = result[5]
        sample_metadata["wfreq"] = result[6]

    return jsonify(sample_metadata)


@app.route("/samples/<sample>")
def samples(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    sel2 = [
        Samples.id,
        Samples.otu_ids,
        Samples.sample_values,
        Samples.otu_labels,
    ]

    results2 = db.session.query(*sel2).filter(Samples.id == sample).all()

    samples = {}
    for result2 in results2:

        samples["otu_ids"] = result2[1]
        samples["sample_values"] = result2[2]
        samples["otu_labels"] = result2[3]

    return jsonify(samples)


if __name__ == "__main__":
    app.run()
