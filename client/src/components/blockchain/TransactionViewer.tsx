import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TransactionViewerProps {
  transactions: Transaction[];
}

export default function TransactionViewer({ transactions }: TransactionViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                    {transaction.status}
                  </Badge>
                  <span className="text-sm font-medium">{transaction.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(transaction.timestamp), "PPpp")}
                </span>
              </div>
              
              <div className="text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p>User #{transaction.fromUserId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p>User #{transaction.toUserId}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
