
  
make_normal <- function(population_mean, population_sd, group_name){
  lower_bound <- population_mean - population_sd 
  upper_bound <- population_mean + population_sd 
  x <- seq(-4, 4, length = 1000) * population_sd + population_mean
  y <- dnorm(x, population_mean, population_sd)
  data.frame(x, y, group = group_name)
}
    
make_normal(2, .5, "g1") %>%
  bind_rows(make_normal(8,.5, "g2")) %>%
  ggplot(aes(x,y)) +
  geom_hline(aes(yintercept = 0))+
  geom_line() +
  xlim(0,10) +
  theme_blank() 

 make_normal(2, .2, "g1") %>%
   bind_rows(make_normal(8,.2, "g2")) %>%
   ggplot(aes(x,y)) +
   geom_hline(aes(yintercept = 0))+
   xlim(0,10) +
   geom_line() +
   theme_blank() 
 
 make_normal(2, 2, "g1") %>%
   bind_rows(make_normal(8,2, "g2")) %>%
   ggplot(aes(x,y)) +
   geom_hline(aes(yintercept = 0))+
   xlim(0,10) +
   geom_line() +
   theme_blank()


  
  

