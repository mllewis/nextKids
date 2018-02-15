library(shiny)
library(tidyr)
library(plyr)
library(stats)
library(googlesheets)
library(ggplot2)

#read in data
d <- as.data.frame(gs_read(ss=gs_title("Dummy Response")))
#prep data (pretty messy) and get into a distance matrix
#collect just the number of times an item was chosen
chosen=ddply(d,.(target,response),summarize,choice=sum(!is.na(response)))
colnames(chosen)[colnames(chosen)=="response"]="item"
#collect just the number of times an item was NOT chosen
notChosen=ddply(d,.(target,notChosen),summarize,notchoice=sum(!is.na(notChosen)))
colnames(notChosen)[colnames(notChosen)=="notChosen"]="item"
#merge into one dataset
temp=merge(chosen,notChosen,all=T)
#calculate percent choices
temp$choice=ifelse(is.na(temp$choice),0,temp$choice)
temp$notchoice=ifelse(is.na(temp$notchoice),0,temp$notchoice)
temp$percentChoice=temp$choice/(temp$choice+temp$notchoice)
#put into a wide format
wideD=spread(subset(temp,select=c(target,item,percentChoice)),item,percentChoice)
row.names(wideD)=wideD$target
#convert to matrix
m=as.matrix(wideD[,2:length(wideD)])
diag(m)=ifelse(is.na(diag(m)),1,NA)
#compute distance matrix
distance=dist(m)
distanceMatrix=as.matrix(distance)

ui <- fluidPage(
  tags$h1("All Data"),
  selectInput("food_all", "Choose a food type", rownames(m)),
  #plotOutput("dend"),
  textOutput("tableLab_all"),
  tableOutput("table_all"),
  plotOutput("mds_all"),
  #passwordInput("familyID", "Enter your family ID"),
  tags$h1("Enter your ID and click GO to view your personal data"),
  textInput("familyID", "Enter ID here and click GO:"),
  actionButton("go", "GO"),
  conditionalPanel(
    condition = "input.go == true",
    textOutput("error_fam"),
    selectInput("food_fam", "Choose a food type", rownames(m)),
    textOutput("tableLab_fam"),
    tableOutput("table_fam"),
    textOutput("rank_fam"),
    plotOutput("mds_fam")   
  )
  
)

server <- function(input, output) {
  

  #output$dend <- renderPlot({
  #  hc <- hclust(distance)# apply hirarchical clustering 
  #  plot(hc)# plot the dendrogram
  #})
  
  output$mds_all <- renderPlot({
    #req(input$go)
    #multi-dimensional scaling
    fit <- cmdscale(distance,eig=TRUE, k=2)
    pD = data.frame(x=fit$points[,1],y=fit$points[,2],name=row.names(m))
    ggplot(pD,aes(x, y,label=name))+
      geom_point()+
      geom_label(size=7)+
      geom_label(data=subset(pD,name==input$food_all),color="red",size=7)+
      theme_classic(base_size=16)
  })
  output$table_all <-renderTable({
    #req(input$go)
    #compute five closest points
    vec=distanceMatrix[input$food_all,order(distanceMatrix[input$food_all,])]
    vec=vec[names(vec)!=input$food_all]
    data.frame(food=names(vec[1:5]),distance=vec[1:5],row.names=NULL)
  })
  
  output$tableLab_all <- renderText({
    #req(input$go)
    paste("Five closest food items to ",input$food_all)
  })
  
  #rendering family specific data
  fam_matrix_list <- reactive({
    req(input$go)
    if (input$familyID %in% unique(d$familyID)) {
      famD <- subset(d,familyID==input$familyID)
      #collect just the number of times an item was chosen
      chosen_fam=ddply(famD,.(target,response,subj_type),summarize,choice=sum(!is.na(response)))
      colnames(chosen_fam)[colnames(chosen_fam)=="response"]="item"
      #collect just the number of times an item was NOT chosen
      notChosen_fam=ddply(famD,.(target,notChosen,subj_type),summarize,notchoice=sum(!is.na(notChosen)))
      colnames(notChosen_fam)[colnames(notChosen_fam)=="notChosen"]="item"
      #merge into one dataset
      temp_fam=merge(chosen_fam,notChosen_fam,all=T)
      #calculate percent choices
      temp_fam$choice=ifelse(is.na(temp_fam$choice),0,temp_fam$choice)
      temp_fam$notchoice=ifelse(is.na(temp_fam$notchoice),0,temp_fam$notchoice)
      temp_fam$percentChoice=temp_fam$choice/(temp_fam$choice+temp_fam$notchoice)
      #put into a wide format
      wideD=spread(subset(temp_fam,select=c(subj_type,target,item,percentChoice)),item,percentChoice)
      #split into kid and adult response data frame
      adult_wideD <- subset(wideD,subj_type=="adult",select=-c(subj_type))
      row.names(adult_wideD)=adult_wideD$target
      kid_wideD <- subset(wideD,subj_type=="kid",select=-c(subj_type))
      row.names(kid_wideD)=kid_wideD$target
      #convert to matrix
      m_adult=as.matrix(adult_wideD[,2:length(adult_wideD)])
      m_kid=as.matrix(kid_wideD[,2:length(kid_wideD)])
      diag(m_adult)=ifelse(is.na(diag(m_adult)),1,NA)
      diag(m_kid)=ifelse(is.na(diag(m_kid)),1,NA)
      #compute distance matrix
      distance_adult=dist(m_adult)
      distanceMatrix_adult=as.matrix(distance_adult)
      distance_kid=dist(m_kid)
      distanceMatrix_kid=as.matrix(distance_kid)
      
      #store everything in a list of lists
      list(adult=list(distObj=distance_adult,distMatrix=distanceMatrix_adult),kid=list(distObj=distance_kid,distMatrix=distanceMatrix_kid))
    }
  })
  
  output$tableLab_fam <- renderText({
      #req(input$go)
    if (input$familyID %in% unique(d$familyID)) {
      paste("Five closest food items to ",input$food_fam)
    }
    })
    
    output$mds_fam <- renderPlot({
      #req(input$go)
      if (input$familyID %in% unique(d$familyID)) {
      fam_data <- fam_matrix_list()
      #multi-dimensional scaling
      fit_adult <- cmdscale(fam_data$adult$distObj,eig=TRUE, k=2)
      fit_kid <- cmdscale(fam_data$kid$distObj,eig=TRUE, k=2)
      pD = data.frame(subj_type=c(rep("parent",length(row.names(fam_data$adult$distMatrix))),rep("child",length(row.names(fam_data$kid$distMatrix)))),x=c(fit_adult$points[,1],fit_kid$points[,1]),y=c(fit_adult$points[,2],fit_kid$points[,2]),name=c(row.names(fam_data$adult$distMatrix),row.names(fam_data$kid$distMatrix)))
      ggplot(pD,aes(x, y,label=name))+
        geom_point()+
        geom_label(size=7)+
        geom_label(data=subset(pD,name==input$food_fam),color="red",size=7)+
        theme_classic(base_size=16)+
        facet_wrap(~subj_type)
      }
    })
    
    output$table_fam <-renderTable({
      #req(input$go)
      if (input$familyID %in% unique(d$familyID)) {
      #compute five closest points
      fam_data <- fam_matrix_list()
      vec_adult <- fam_data$adult$distMatrix[input$food_fam,order(fam_data$adult$distMatrix[input$food_fam,])]
      vec_adult <- vec_adult[names(vec_adult)!=input$food_fam]
      vec_kid <- fam_data$kid$distMatrix[input$food_fam,order(fam_data$kid$distMatrix[input$food_fam,])]
      vec_kid <- vec_kid[names(vec_kid)!=input$food_fam]
      data.frame("food parent"=names(vec_adult[1:5]),"distance parent"=vec_adult[1:5],"food child"=names(vec_kid[1:5]),"distance child"=vec_kid[1:5],row.names=NULL)
      }
    })
  
    output$rank_fam <- renderText({
      #req(input$go)
      if (input$familyID %in% unique(d$familyID)) {
      fam_data <- fam_matrix_list()
      vec_adult <- fam_data$adult$distMatrix[input$food_fam,order(fam_data$adult$distMatrix[input$food_fam,])]
      #kid vector ordered by adult names
      vec_kid <- fam_data$kid$distMatrix[input$food_fam,order(fam_data$adult$distMatrix[input$food_fam,])]
      #calculate Spearman correlation
      rho=suppressWarnings(cor.test(vec_adult,vec_kid,method="spearman"))
      paste("Spearman rank correlation for ",input$food_fam," is ",round(rho$estimate,2))
      }
    })
    
   output$error_fam <- renderText({
    req(input$go)
     if (!(input$familyID %in% unique(d$familyID))) {
      paste(input$familyID," is not a valid ID. Please reload the webpage and try again")
     }
    })
  
  
}

shinyApp(ui = ui, server = server)