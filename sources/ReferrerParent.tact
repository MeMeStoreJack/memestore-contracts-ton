import "@stdlib/deploy";
message NewReferrer {
    referrer: Address;
}
message NewReferrerInternal {
    sender: Address;
    referrer: Address;
}
message ReferrerNotification {
    sender: Address;
    referrer: Address;
}
message ReferrerSetEvent {
    owner: Address;
    referrer: Address;
}

contract ReferrerParent with Deployable {
    seqno: Int as uint256;
    init(){
        self.seqno = 0;
    }

    receive(){}

    receive("deploy"){}

    receive(msg: NewReferrer){
        require(msg.referrer != sender(), "self referrer");
        require(context().value >= ton("0.1"), "not enough value");
        self.seqno += 1;
        let init: StateInit = initOf ReferrerChild(myAddress(), sender());
        let child: Address = contractAddress(init);
        send(SendParameters{
                to: child,
                bounce: true,
                body: NewReferrerInternal{sender: sender(), referrer: msg.referrer}.toCell(),
                value: ton("0.1"), // pay for the deployment and leave some TON in the child for storage, 0.03 out of gas
                mode: SendIgnoreErrors,
                code: init.code, // deploy the child if needed
                data: init.data
            }
        );
    }

    receive(msg: ReferrerNotification){
        let expected: Address = contractAddress(initOf ReferrerChild(myAddress(), msg.sender));
        require(sender() == expected, "fake child");
        emit(ReferrerSetEvent{owner: msg.sender, referrer: msg.referrer}.toCell());
    }

    get fun seqno(): Int {
        return self.seqno;
    }

    get fun childAddress(owner: Address): Address {
        return contractAddress(initOf ReferrerChild(myAddress(), owner));
    }
}

contract ReferrerChild {
    parent: Address;
    owner: Address;
    referrer: Address;
    init(parent: Address, owner: Address){
        self.parent = parent;
        self.owner = owner;
        self.referrer = newAddress(0, 0);
    }

    receive(){}

    receive(msg: NewReferrerInternal){
        require(sender() == self.parent && msg.sender == self.owner, "not parent");
        self.referrer = msg.referrer;
        send(SendParameters{
                to: self.parent,
                body: ReferrerNotification{sender: msg.sender, referrer: self.referrer}.toCell(),
                value: ton("0.05"),
                mode: SendIgnoreErrors
            }
        );
    }

    get fun owner(): Address {
        return self.owner;
    }

    get fun referrer(): Address {
        return self.referrer;
    }
}