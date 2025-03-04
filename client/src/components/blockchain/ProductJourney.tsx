import { Product, Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ProductJourneyProps {
  product: Product;
  transactions: Transaction[];
}

export default function ProductJourney({ product, transactions }: ProductJourneyProps) {
  const sortedTransactions = [...transactions]
    .filter(t => t.productId === product.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8 border-l-2 border-border">
          {sortedTransactions.map((transaction, index) => (
            <div key={transaction.id} className="mb-8 relative">
              {/* Timeline dot */}
              <div className="absolute -left-[33px] w-4 h-4 bg-primary rounded-full" />
              
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{transaction.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(transaction.timestamp), "PPp")}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">From: </span>
                    User #{transaction.fromUserId}
                  </p>
                  <p>
                    <span className="text-muted-foreground">To: </span>
                    User #{transaction.toUserId}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    {transaction.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
