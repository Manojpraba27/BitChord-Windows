import { Link } from "react-router";
/** Account actions always lead to the desktop OAuth/settings cards. */
export function AccountButton() {
  return (
    <Link
      to="/integrations"
      className="self-start rounded-[16px] bg-key px-3.5 py-[5px] type-[600_13px/18px] text-white hover:brightness-[1.08]"
    >
      Accounts
    </Link>
  );
}
