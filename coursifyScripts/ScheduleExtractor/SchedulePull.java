import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class SchedulePull {








    public static void main(String[] args) throws IOException {
        Document doc = Jsoup.connect("https://catalog.njit.edu/undergraduate/science-liberal-arts/mathematical-sciences/applied-mathematics/").get();
        Elements allTR = doc.select("tr");
        String filePath = "appliedMathschedule.txt";
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            //Iterate by tr, then get all th
            //System.out.println(allTR);
            for(Element th : allTR){
                String textUse = th.text();
                if(textUse.substring(0,1).contains("R")){
                    continue;
                }

                writer.write(textUse+ "\n");

            }
            System.out.println("Successfully wrote to the file.");
        } catch (IOException e) {
            System.err.println("An error occurred writing to the file: " + e.getMessage());
        }

    }

}
