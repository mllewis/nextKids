## Using Chris's code to generate NEXT embeddings ##

See https://github.com/crcox/condortools for parts of the setup (if you plan to set up many jobs/parameterizations).


## STEPS ##

1. Make sure response data file is in the correct format. See example-responses.csv for example

2. Set up a "stub.yaml" configuration file to specify your parameters. See https://github.com/crcox/condortools. 

=====================
Modifiable Parameters
=====================
traincode: CK   	 ## Label for training set
testcode: Test  	 ## Label for test set 
proportion: 1   	 ## What proportion of the data are we using for estimation?
ndim: [2,3,4]   	 ## Number of dimensions for embedding(s) 
epsilon: 0.0000001   ## Magic value that should be set very low
mu: 0.01 	    	 ## Parameter specific to crowdkernel, do not modify
max_norm: 0     	 ## Parameter specific to crowdkernel, do not modify
randomRestarts: 10 	 ## Number of random restarts, good rule of thumb is 10
max_iter_GD: 50
max_num_passes_SGD: 32
verbose: true
ActiveLearningMethod: crowdkernel ## Options: crowdkernel or mds (uncertainty sampling)


=============================
Kevin's Recommended Settings
=============================
"For embeddings you want to be confident about, I would set:"
epsilon: 0.0000001
randomRestarts: 10
max_iter_GD: 50
max_num_passes_SGD: 32 



3. Run: `condortools/expandStub_yaml.py stub.yaml` to generate a master.yaml file.  See https://github.com/crcox/condortools for explanation.

Example:
$ python condortools/expandStub_yaml.py stub.yaml


3. Run: `condortools/setupJobs_yaml.py master.yaml` to create a directory for each unique parameterization and place a unique config file in that directory.

Example:
$ python condortools/setupJobs_yaml.py master.yaml 


4. Run: `nextmds/generateEmbedding.py path/to/job [path/to/job, ...]` to execute all jobs. The result of each job will be output to the corresponding directory. The results can the be compiled after the fact.

Example for 1 through 5 dimensions:

$ python ../nextmds/generateEmbedding.py 0 1 2 3 4  


## DEBUGGING ##

For this error:
_csv.Error: new-line character seen in unquoted field - do you need to open the file in universal-newline mode? 

This is because Excel screws up csv files. Open csv file in R, save as csv in R, proceed.



