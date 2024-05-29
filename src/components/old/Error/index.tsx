import React, { ReactNode } from "react";
import { CircleAlertIcon } from "lucide-react";

export const Error = ({ children }: { children: ReactNode }) => {
	return (
		<div className="twcss">
			<div className="rounded-md border-dashed border-[var(--text-error)] p-4">
				<h2 className="mt-0 flex items-center justify-start gap-2">
					<CircleAlertIcon color="var(--text-error)" size={25} />
					Error
				</h2>
				{children}
			</div>
		</div>
	);
};
